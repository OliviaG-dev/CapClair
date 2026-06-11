import crypto from 'node:crypto'

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }
  return fallback
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
const MAX_ANSWER_LENGTH = toPositiveNumber(process.env.SYNTHESIZE_MAX_ANSWER_LENGTH, 700)
const RATE_LIMIT_WINDOW_MS = toPositiveNumber(
  process.env.SYNTHESIZE_RATE_LIMIT_WINDOW_MS,
  10 * 60 * 1000,
)
const RATE_LIMIT_MAX_REQUESTS = toPositiveNumber(process.env.SYNTHESIZE_RATE_LIMIT_MAX_REQUESTS, 12)
const RATE_LIMIT_NAMESPACE = process.env.SYNTHESIZE_RATE_LIMIT_NAMESPACE || 'synthesize'
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const TURNSTILE_EXPECTED_ACTION = process.env.TURNSTILE_EXPECTED_ACTION || 'onboarding_synthesize'
const RATE_LIMIT_STORE = new Map()

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

const isTurnstileEnabled = () => isNonEmptyString(TURNSTILE_SECRET_KEY)

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

const addOriginCandidate = (origins, value) => {
  if (!isNonEmptyString(value)) {
    return
  }

  const trimmed = value.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    origins.add(trimmed)
    return
  }

  origins.add(`https://${trimmed}`)
}

const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.SYNTHESIZE_ALLOWED_ORIGINS || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (configuredOrigins.length > 0) {
    return configuredOrigins
  }

  const fallbackOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])

  addOriginCandidate(fallbackOrigins, process.env.VERCEL_URL)
  addOriginCandidate(fallbackOrigins, process.env.VERCEL_BRANCH_URL)
  addOriginCandidate(fallbackOrigins, process.env.VERCEL_PROJECT_PRODUCTION_URL)

  return [...fallbackOrigins]
}

const isVercelAppOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin)
    return protocol === 'https:' && hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

const isRequestOriginAllowed = (req) => {
  const origin = req.headers.origin
  if (!isNonEmptyString(origin)) {
    return false
  }

  const allowedOrigins = getAllowedOrigins()
  if (allowedOrigins.includes(origin)) {
    return true
  }

  if (process.env.VERCEL === '1' && isVercelAppOrigin(origin)) {
    return true
  }

  return false
}

const isRequestAuthorized = (req) => {
  const expectedApiKey = process.env.SYNTHESIZE_API_KEY
  if (!isNonEmptyString(expectedApiKey)) {
    return true
  }

  const providedApiKey = req.headers['x-capclair-api-key']
  if (!isNonEmptyString(providedApiKey)) {
    return false
  }

  return safeEqual(expectedApiKey, providedApiKey)
}

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for']
  if (isNonEmptyString(forwardedFor)) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip']
  if (isNonEmptyString(realIp)) {
    return realIp.trim()
  }

  return req.socket?.remoteAddress || 'unknown'
}

const consumeLocalRateLimit = (key) => {
  const now = Date.now()
  const existingTimestamps = RATE_LIMIT_STORE.get(key) || []
  const validTimestamps = existingTimestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - validTimestamps[0])
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  validTimestamps.push(now)
  RATE_LIMIT_STORE.set(key, validTimestamps)

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

const isUpstashConfigured = () =>
  isNonEmptyString(UPSTASH_REDIS_REST_URL) && isNonEmptyString(UPSTASH_REDIS_REST_TOKEN)

const callUpstash = async (commandParts) => {
  const encodedCommand = commandParts.map((part) => encodeURIComponent(String(part))).join('/')
  const response = await fetch(`${UPSTASH_REDIS_REST_URL}/${encodedCommand}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error('Upstash request failed')
  }

  const payload = await response.json()
  return payload?.result
}

const consumeDistributedRateLimit = async (key) => {
  const now = Date.now()
  const currentWindow = Math.floor(now / RATE_LIMIT_WINDOW_MS)
  const windowKey = `rate:${RATE_LIMIT_NAMESPACE}:${key}:${currentWindow}`
  const expiresAfterSeconds = Math.max(1, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) + 1)

  const count = Number(await callUpstash(['INCR', windowKey]))
  if (count === 1) {
    await callUpstash(['EXPIRE', windowKey, expiresAfterSeconds])
  }

  if (count > RATE_LIMIT_MAX_REQUESTS) {
    const nextWindowTimestamp = (currentWindow + 1) * RATE_LIMIT_WINDOW_MS
    const retryAfterMs = nextWindowTimestamp - now
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

const consumeRateLimit = async (key) => {
  if (!isUpstashConfigured()) {
    return consumeLocalRateLimit(key)
  }

  try {
    return await consumeDistributedRateLimit(key)
  } catch (error) {
    // If distributed limiter is temporarily unavailable, fallback to local limiter.
    return consumeLocalRateLimit(key)
  }
}

const readAnswers = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const answers = payload.answers
  if (!answers || typeof answers !== 'object') {
    return null
  }

  const requiredKeys = [
    'changeWish',
    'heaviestWeight',
    'improvementFocus',
    'blockingFactor',
    'energySource',
    'progressVision',
  ]

  for (const key of requiredKeys) {
    if (!isNonEmptyString(answers[key])) {
      return null
    }
    if (answers[key].trim().length > MAX_ANSWER_LENGTH) {
      return null
    }
  }

  return answers
}

const readTurnstileToken = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const token = payload.turnstileToken
  if (!isNonEmptyString(token)) {
    return ''
  }

  return token.trim()
}

const verifyTurnstileToken = async (req, token) => {
  if (!isTurnstileEnabled()) {
    return {
      ok: true,
      statusCode: 200,
      message: '',
    }
  }

  if (!isNonEmptyString(token)) {
    return {
      ok: false,
      statusCode: 403,
      message: 'Missing Turnstile token',
    }
  }

  try {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: getClientIp(req),
    })

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      return {
        ok: false,
        statusCode: 503,
        message: 'Turnstile verification unavailable',
      }
    }

    const payload = await response.json()
    const action = payload?.action
    const success = payload?.success === true
    if (!success || (isNonEmptyString(TURNSTILE_EXPECTED_ACTION) && action !== TURNSTILE_EXPECTED_ACTION)) {
      return {
        ok: false,
        statusCode: 403,
        message: 'Invalid Turnstile token',
      }
    }

    return {
      ok: true,
      statusCode: 200,
      message: '',
    }
  } catch (error) {
    return {
      ok: false,
      statusCode: 503,
      message: 'Turnstile verification failed',
    }
  }
}

const extractContent = (messageContent) => {
  if (typeof messageContent === 'string') {
    return messageContent
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }
        if (part && typeof part === 'object' && typeof part.text === 'string') {
          return part.text
        }
        return ''
      })
      .join('\n')
  }

  return ''
}

const buildPrompt = (answers) => `Tu es un coach de clarté personnelle bienveillant pour CapClair.
Réponds UNIQUEMENT avec un JSON valide.

Contraintes générales:
- français simple et humain, avec les accents corrects
- concret, réaliste, bienveillant
- pas de jugement
- base-toi uniquement sur les réponses utilisateur

Pour la synthèse:
- wantsToChange: reformule ce que la personne veut faire évoluer (2-3 phrases max)
- blockers: reformule les freins principaux (2-3 phrases max)
- importantThemes: 3 priorités courtes
- suggestedGoals: titres des objectifs générés (mêmes titres que objectives[].title)
- firstAction: une seule micro-action faisable aujourd'hui (< 20 min)

Pour objectives (3 à 5 objectifs SMART):
- title: une phrase actionnable, claire, commence de préférence par un verbe
- description: une phrase qui explique pourquoi cet objectif compte maintenant
- actionLabel: une valeur parmi "Clarifier", "Agir sur", "Prioriser", "Renforcer"
- deepReason: lien avec le changement souhaité (changeWish)
- obstacles: 1 à 3 freins concrets tirés des réponses
- motivation: une phrase de motivation liée aux priorités de la personne
- nextSteps: 2 ou 3 micro-actions concretes (< 20 min chacune)
- difficulty: "easy", "medium" ou "hard"

Schema JSON attendu:
{
  "synthesis": {
    "wantsToChange": "string",
    "blockers": "string",
    "importantThemes": ["string", "string", "string"],
    "suggestedGoals": ["string", "string", "string"],
    "firstAction": "string"
  },
  "objectives": [
    {
      "title": "string",
      "description": "string",
      "actionLabel": "Clarifier|Agir sur|Prioriser|Renforcer",
      "deepReason": "string",
      "obstacles": ["string"],
      "motivation": "string",
      "nextSteps": ["string", "string"],
      "difficulty": "easy|medium|hard"
    }
  ]
}

Reponses utilisateur:
- changeWish: ${answers.changeWish}
- heaviestWeight: ${answers.heaviestWeight}
- improvementFocus: ${answers.improvementFocus}
- blockingFactor: ${answers.blockingFactor}
- energySource: ${answers.energySource}
- progressVision: ${answers.progressVision}
`

const OBJECTIVE_ITEM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    actionLabel: {
      type: 'string',
      enum: ['Clarifier', 'Agir sur', 'Prioriser', 'Renforcer'],
    },
    deepReason: { type: 'string' },
    obstacles: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3,
    },
    motivation: { type: 'string' },
    nextSteps: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 3,
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
    },
  },
  required: [
    'title',
    'description',
    'actionLabel',
    'deepReason',
    'obstacles',
    'motivation',
    'nextSteps',
    'difficulty',
  ],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isRequestOriginAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  if (!isRequestAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const rateLimitKey = getClientIp(req)
  const rateLimitResult = await consumeRateLimit(rateLimitKey)
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds))
    return res.status(429).json({ error: 'Too many requests' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  const answers = readAnswers(req.body)
  if (!answers) {
    return res.status(400).json({ error: 'Invalid onboarding answers payload' })
  }

  const turnstileToken = readTurnstileToken(req.body)
  const turnstileResult = await verifyTurnstileToken(req, turnstileToken)
  if (!turnstileResult.ok) {
    return res.status(turnstileResult.statusCode).json({ error: turnstileResult.message })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'capclair_synthesis',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                synthesis: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    wantsToChange: { type: 'string' },
                    blockers: { type: 'string' },
                    importantThemes: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 3,
                      maxItems: 3,
                    },
                    suggestedGoals: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 3,
                      maxItems: 5,
                    },
                    firstAction: { type: 'string' },
                  },
                  required: [
                    'wantsToChange',
                    'blockers',
                    'importantThemes',
                    'suggestedGoals',
                    'firstAction',
                  ],
                },
                objectives: {
                  type: 'array',
                  items: OBJECTIVE_ITEM_SCHEMA,
                  minItems: 3,
                  maxItems: 5,
                },
              },
              required: ['synthesis', 'objectives'],
            },
          },
        },
        messages: [
          {
            role: 'user',
            content: buildPrompt(answers),
          },
        ],
      }),
      signal: controller.signal,
    })

    if (!openAiResponse.ok) {
      return res.status(502).json({ error: 'OpenAI request failed' })
    }

    const parsed = await openAiResponse.json()
    const rawContent = extractContent(parsed?.choices?.[0]?.message?.content)

    if (!rawContent) {
      return res.status(502).json({ error: 'OpenAI returned empty content' })
    }

    const result = JSON.parse(rawContent)
    return res.status(200).json(result)
  } catch (error) {
    if (error?.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timeout' })
    }
    return res.status(500).json({ error: 'Unexpected synthesis error' })
  } finally {
    clearTimeout(timeout)
  }
}
