import { describe, expect, it } from 'vitest'
import type { AppState } from '../types/capclair.types'
import { applyDailyActionCompletion } from './completeDailyActionState'

const baseState: AppState = {
  answers: null,
  synthesis: {
    wantsToChange: 'Avancer',
    blockers: 'Le flou',
    importantThemes: ['Travail'],
    suggestedGoals: ['Clarifier ma direction'],
    firstAction: 'Bloquer 15 minutes',
  },
  objectives: [
    {
      id: 'obj-1',
      title: 'Clarifier ma direction',
      description: 'Description',
      deepReason: 'Raison',
      obstacles: ['Obstacle'],
      motivation: 'Motivation',
      nextSteps: ['Etape 1', 'Etape 2'],
      completedSteps: [],
      status: 'in_progress',
      difficulty: 'medium',
      deadline: '2026-12-31',
      progressHistory: [],
    },
  ],
  journal: [],
  handoffCompleted: true,
  actionHistory: [],
  completedSynthesisFirstAction: false,
}

describe('applyDailyActionCompletion', () => {
  it('advances the in-progress objective and logs the action by date', () => {
    const updated = applyDailyActionCompletion(baseState)

    expect(updated.actionHistory).toHaveLength(1)
    expect(updated.actionHistory[0]?.text).toBe('Etape 1')
    expect(updated.objectives[0]?.nextSteps).toEqual(['Etape 2'])
    expect(updated.objectives[0]?.completedSteps).toHaveLength(1)
  })

  it('marks the synthesis first action as completed when no step is available', () => {
    const updated = applyDailyActionCompletion({
      ...baseState,
      objectives: [],
    })

    expect(updated.completedSynthesisFirstAction).toBe(true)
    expect(updated.actionHistory[0]?.source).toBe('synthesis')
  })
})
