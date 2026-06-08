import { describe, expect, it } from 'vitest'
import { formatObjectiveCardHeading } from './formatObjectiveCardHeading'
import type { Objective } from '../types/capclair.types'

const baseObjective: Objective = {
  id: 'obj-1',
  title: 'Retrouver un sommeil régulier',
  description: 'Je veux retrouver un sommeil régulier.',
  deepReason: 'Sommeil',
  obstacles: ['Ecrans'],
  motivation: 'Repos',
  nextSteps: ['Agir'],
  status: 'in_progress',
  difficulty: 'medium',
  deadline: '2026-12-01',
  progressHistory: [],
}

describe('formatObjectiveCardHeading', () => {
  it('uses actionLabel when present', () => {
    const result = formatObjectiveCardHeading({
      ...baseObjective,
      actionLabel: 'Clarifier',
      title: 'Retrouver un sommeil régulier',
    })

    expect(result).toEqual({
      actionLabel: 'Clarifier',
      title: 'Retrouver un sommeil régulier',
    })
  })

  it('parses legacy prefixed titles', () => {
    const result = formatObjectiveCardHeading({
      ...baseObjective,
      title: 'Clarifier : retrouver un sommeil régulier',
    })

    expect(result).toEqual({
      actionLabel: 'Clarifier',
      title: 'retrouver un sommeil régulier',
    })
  })
})
