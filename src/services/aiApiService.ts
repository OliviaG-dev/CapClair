import aiCoachData from '../data/aiCoachData.json'
import type { OnboardingGeneration, QuestionnaireAnswers, Synthesis } from '../types/capclair.types'
import type { ObjectiveDifficulty, ObjectiveDraft } from '../types/capclair.types'

type ApiSynthesisResponse = {
  synthesis?: Partial<Synthesis>
  objectives?: Partial<ObjectiveDraft>[]
}

const allowedActionLabels = new Set(aiCoachData.objectives.actionLabels as string[])
const allowedDifficulties = new Set<ObjectiveDifficulty>(['easy', 'medium', 'hard'])

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.trim().length > 0)

const isValidSynthesis = (value: unknown): value is Synthesis => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Synthesis
  return (
    isNonEmptyString(candidate.wantsToChange) &&
    isNonEmptyString(candidate.blockers) &&
    isStringArray(candidate.importantThemes) &&
    isStringArray(candidate.suggestedGoals) &&
    isNonEmptyString(candidate.firstAction)
  )
}

const isValidObjectiveDraft = (value: unknown): value is ObjectiveDraft => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as ObjectiveDraft
  return (
    isNonEmptyString(candidate.title) &&
    isNonEmptyString(candidate.description) &&
    isNonEmptyString(candidate.actionLabel) &&
    allowedActionLabels.has(candidate.actionLabel) &&
    isNonEmptyString(candidate.deepReason) &&
    isStringArray(candidate.obstacles) &&
    isNonEmptyString(candidate.motivation) &&
    isStringArray(candidate.nextSteps) &&
    candidate.nextSteps.length >= 2 &&
    isNonEmptyString(candidate.difficulty) &&
    allowedDifficulties.has(candidate.difficulty)
  )
}

const isValidObjectives = (value: unknown): value is ObjectiveDraft[] =>
  Array.isArray(value) &&
  value.length >= 3 &&
  value.length <= 5 &&
  value.every(isValidObjectiveDraft)

export type OnboardingApiResult =
  | { ok: true; generation: OnboardingGeneration }
  | { ok: false; error: string; status: number }

const CONFIG_ERROR_STATUSES = new Set([401, 403])

export function isSynthesisConfigError(status: number): boolean {
  return CONFIG_ERROR_STATUSES.has(status)
}

export async function generateOnboardingFromApi(
  answers: QuestionnaireAnswers,
  turnstileToken?: string,
): Promise<OnboardingApiResult> {
  try {
    const apiKey = import.meta.env.VITE_SYNTHESIZE_API_KEY?.trim()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (apiKey) {
      headers['x-capclair-api-key'] = apiKey
    }

    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers, turnstileToken }),
    })

    const rawBody = await response.text()

    if (!response.ok) {
      let errorDetail = 'Synthèse IA indisponible'
      try {
        const parsedError = JSON.parse(rawBody) as { error?: unknown }
        if (typeof parsedError.error === 'string') {
          errorDetail = parsedError.error
        }
      } catch {
        if (rawBody.trim()) {
          errorDetail = rawBody.slice(0, 120)
        }
      }

      console.warn(`[CapClair] Synthèse IA indisponible (${response.status}: ${errorDetail})`)
      return { ok: false, error: errorDetail, status: response.status }
    }

    const payload = JSON.parse(rawBody) as ApiSynthesisResponse
    if (!isValidSynthesis(payload.synthesis)) {
      console.warn('[CapClair] Réponse API reçue mais format de synthèse invalide')
      return {
        ok: false,
        error: 'Réponse API invalide',
        status: response.status,
      }
    }

    const generation: OnboardingGeneration = {
      synthesis: payload.synthesis,
    }

    if (isValidObjectives(payload.objectives)) {
      generation.objectives = payload.objectives
    }

    return { ok: true, generation }
  } catch (error) {
    console.error('Unable to generate onboarding synthesis from API', error)
    return { ok: false, error: 'Erreur réseau', status: 0 }
  }
}
