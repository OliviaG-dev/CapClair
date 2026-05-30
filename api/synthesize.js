const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

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
  }

  return answers
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

const buildPrompt = (answers) => `Tu es un coach de clarte personnelle bienveillant.
Reponds UNIQUEMENT avec un JSON valide.

Contraintes:
- francais simple
- concret
- pas de jugement
- objectifs realistes et actionnables

Schema JSON attendu:
{
  "synthesis": {
    "wantsToChange": "string",
    "blockers": "string",
    "importantThemes": ["string", "string", "string"],
    "suggestedGoals": ["string", "string", "string"],
    "firstAction": "string"
  }
}

Reponses utilisateur:
- changeWish: ${answers.changeWish}
- heaviestWeight: ${answers.heaviestWeight}
- improvementFocus: ${answers.improvementFocus}
- blockingFactor: ${answers.blockingFactor}
- energySource: ${answers.energySource}
- progressVision: ${answers.progressVision}
`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  const answers = readAnswers(req.body)
  if (!answers) {
    return res.status(400).json({ error: 'Invalid onboarding answers payload' })
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
                      maxItems: 3,
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
              },
              required: ['synthesis'],
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
      const details = await openAiResponse.text()
      return res.status(502).json({ error: 'OpenAI request failed', details })
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
