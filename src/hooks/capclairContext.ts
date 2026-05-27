import { createContext } from 'react'
import type { AppState, JournalEntry, Objective, QuestionnaireAnswers } from '../types/capclair.types'

export type CapClairContextValue = {
  state: AppState
  completeOnboarding: (answers: QuestionnaireAnswers) => void
  updateObjective: (objective: Objective) => void
  addProgressNote: (objectiveId: string, note: string, delta: number) => void
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void
  weeklyInsight: string
}

export const CapClairContext = createContext<CapClairContextValue | null>(null)
