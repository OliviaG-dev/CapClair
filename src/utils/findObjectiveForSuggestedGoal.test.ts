import { describe, expect, it } from 'vitest'
import { findObjectiveForSuggestedGoal } from './findObjectiveForSuggestedGoal'
import type { Objective } from '../types/capclair.types'

const baseObjective: Objective = {
  id: 'obj-1',
  title: 'Clarifier ma direction',
  description: 'Clarifier ma direction',
  deepReason: 'Raison',
  obstacles: ['Flou'],
  motivation: 'Motivation',
  nextSteps: ['Etape 1'],
  status: 'todo',
  difficulty: 'medium',
  deadline: '2026-12-31',
  progressHistory: [],
}

describe('findObjectiveForSuggestedGoal', () => {
  it('matches objective by exact title', () => {
    const result = findObjectiveForSuggestedGoal('Clarifier ma direction', 0, [baseObjective])
    expect(result?.id).toBe('obj-1')
  })

  it('falls back to index when titles differ slightly', () => {
    const secondObjective = { ...baseObjective, id: 'obj-2', title: 'Stabiliser ma routine' }
    const result = findObjectiveForSuggestedGoal('Piste differente', 1, [baseObjective, secondObjective])
    expect(result?.id).toBe('obj-2')
  })

  it('returns undefined when no objectives exist', () => {
    expect(findObjectiveForSuggestedGoal('Test', 0, [])).toBeUndefined()
  })
})
