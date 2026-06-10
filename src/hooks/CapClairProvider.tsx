import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildWeeklyInsight, resolveOnboardingGeneration } from '../services/aiCoachService'
import { loadState, persistState } from '../services/storageService'
import type { AppState } from '../types/capclair.types'
import {
  applyPrimaryObjectiveStatus,
  reconcileObjectiveUpdate,
} from '../utils/reconcileObjectiveUpdate'
import { CapClairContext, type CapClairContextValue } from './capclairContext'

export function CapClairProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    persistState(state)
  }, [state])

  const value = useMemo<CapClairContextValue>(
    () => ({
      state,
      completeOnboarding: (answers, generationOverride) => {
        const { synthesis, objectives } = resolveOnboardingGeneration(answers, generationOverride)
        setState({
          answers,
          synthesis,
          objectives,
          journal: [],
          handoffCompleted: false,
        })
      },
      refreshSynthesis: (answers, generationOverride) => {
        const { synthesis, objectives } = resolveOnboardingGeneration(answers, generationOverride)
        setState((previous) => ({
          answers,
          synthesis,
          objectives,
          journal: previous.journal,
          handoffCompleted: false,
        }))
      },
      updateObjective: (updatedObjective) => {
        setState((previous) => ({
          ...previous,
          objectives: reconcileObjectiveUpdate(previous.objectives, updatedObjective),
        }))
      },
      addProgressNote: (objectiveId, note, delta) => {
        if (!note.trim()) {
          return
        }

        setState((previous) => ({
          ...previous,
          objectives: previous.objectives.map((objective) => {
            if (objective.id !== objectiveId) {
              return objective
            }

            return {
              ...objective,
              progressHistory: [
                {
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  note: note.trim(),
                  delta,
                },
                ...objective.progressHistory,
              ],
            }
          }),
        }))
      },
      addJournalEntry: (entry) => {
        if (!entry.note.trim()) {
          return
        }

        setState((previous) => ({
          ...previous,
          journal: [
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              mood: entry.mood,
              energy: entry.energy,
              note: entry.note.trim(),
            },
            ...previous.journal,
          ],
        }))
      },
      completeHandoff: (primaryObjectiveId) => {
        setState((previous) => ({
          ...previous,
          handoffCompleted: true,
          objectives: applyPrimaryObjectiveStatus(previous.objectives, primaryObjectiveId),
        }))
      },
      weeklyInsight: buildWeeklyInsight(state),
    }),
    [state],
  )

  return <CapClairContext.Provider value={value}>{children}</CapClairContext.Provider>
}
