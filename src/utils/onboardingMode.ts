import type { QuestionnaireAnswers } from '../types/capclair.types'

export type OnboardingMode = 'full' | 'refresh'

export type OnboardingQuestion = {
  key: keyof QuestionnaireAnswers
  label: string
}

export const resolveOnboardingMode = (modeParam: string | null): OnboardingMode =>
  modeParam === 'refresh' ? 'refresh' : 'full'

export const getQuestionsForMode = (
  mode: OnboardingMode,
  fullQuestions: OnboardingQuestion[],
  refreshQuestions: OnboardingQuestion[],
): OnboardingQuestion[] => (mode === 'refresh' ? refreshQuestions : fullQuestions)

export const buildInitialAnswers = (
  mode: OnboardingMode,
  previousAnswers: QuestionnaireAnswers | null,
  emptyAnswers: QuestionnaireAnswers,
): QuestionnaireAnswers => {
  if (mode !== 'refresh' || !previousAnswers) {
    return emptyAnswers
  }

  return {
    ...emptyAnswers,
    ...previousAnswers,
  }
}
