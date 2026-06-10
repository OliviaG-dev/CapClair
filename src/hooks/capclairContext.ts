import { createContext } from 'react'
import type {
  AppState,
  JournalEntry,
  Objective,
  OnboardingGeneration,
  QuestionnaireAnswers,
} from '../types/capclair.types'

export type CapClairContextValue = {
  state: AppState
  completeOnboarding: (
    answers: QuestionnaireAnswers,
    generationOverride?: OnboardingGeneration,
  ) => void
  updateObjective: (objective: Objective) => void
  addProgressNote: (objectiveId: string, note: string, delta: number) => void
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void
  refreshSynthesis: (
    answers: QuestionnaireAnswers,
    generationOverride?: OnboardingGeneration,
  ) => void
  completeHandoff: (primaryObjectiveId: string) => void
  completeDailyAction: () => void
  completeObjectiveStep: (objectiveId: string) => void
  weeklyInsight: string
}

export const CapClairContext = createContext<CapClairContextValue | null>(null)
