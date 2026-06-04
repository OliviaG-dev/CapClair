import type { OnboardingGeneration, QuestionnaireAnswers, Synthesis } from '../types/capclair.types'

type ApiSynthesisResponse = {
  synthesis?: Partial<Synthesis>
}

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

export async function generateOnboardingFromApi(
  answers: QuestionnaireAnswers,
  turnstileToken?: string,
): Promise<OnboardingGeneration | null> {
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

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as ApiSynthesisResponse
    if (!isValidSynthesis(payload.synthesis)) {
      return null
    }

    return {
      synthesis: payload.synthesis,
    }
  } catch (error) {
    console.error('Unable to generate onboarding synthesis from API', error)
    return null
  }
}
