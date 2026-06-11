import { describe, expect, it } from 'vitest'
import type { Objective } from '../types/capclair.types'
import { advanceObjectiveStep, findCurrentStep } from './advanceObjectiveStep'

const baseObjective: Objective = {
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
}

describe('advanceObjectiveStep', () => {
  it('moves the current step to completedSteps and keeps the next one pending', () => {
    const advanced = advanceObjectiveStep(baseObjective, '2026-06-06T10:00:00.000Z')

    expect(findCurrentStep(advanced.nextSteps)).toBe('Etape 2')
    expect(advanced.completedSteps).toHaveLength(1)
    expect(advanced.completedSteps[0]?.text).toBe('Etape 1')
    expect(advanced.progressHistory[0]?.note).toContain('Etape 1')
    expect(advanced.status).toBe('in_progress')
  })

  it('marks the objective as done when the last step is completed', () => {
    const advanced = advanceObjectiveStep(
      { ...baseObjective, nextSteps: ['Derniere etape'] },
      '2026-06-06T10:00:00.000Z',
    )

    expect(advanced.nextSteps).toHaveLength(0)
    expect(advanced.status).toBe('done')
  })
})
