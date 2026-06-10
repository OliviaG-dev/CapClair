import { describe, expect, it } from 'vitest'
import type { Objective } from '../types/capclair.types'
import { mergeObjectivesOnRefresh } from './mergeObjectivesOnRefresh'

const existingObjectives: Objective[] = [
  {
    id: 'obj-keep',
    title: 'Clarifier ma direction',
    description: 'Ancienne description',
    deepReason: 'Raison',
    obstacles: ['Obstacle'],
    motivation: 'Motivation',
    nextSteps: ['Etape restante'],
    completedSteps: [
      {
        id: 'done-1',
        text: 'Etape faite',
        completedAt: '2026-06-01T10:00:00.000Z',
      },
    ],
    status: 'in_progress',
    difficulty: 'medium',
    deadline: '2026-12-31',
    progressHistory: [
      {
        id: 'note-1',
        createdAt: '2026-06-01T10:00:00.000Z',
        note: 'Bonne avancee',
        delta: 1,
      },
    ],
  },
]

const generatedObjectives: Objective[] = [
  {
    id: 'obj-new',
    title: 'Clarifier ma direction',
    description: 'Nouvelle description',
    deepReason: 'Nouvelle raison',
    obstacles: ['Nouveau frein'],
    motivation: 'Nouvelle motivation',
    nextSteps: ['Nouvelle etape 1', 'Nouvelle etape 2'],
    completedSteps: [],
    status: 'todo',
    difficulty: 'easy',
    deadline: '2027-01-01',
    progressHistory: [],
  },
]

describe('mergeObjectivesOnRefresh', () => {
  it('preserves status, notes and pending steps for similar objectives', () => {
    const merged = mergeObjectivesOnRefresh(existingObjectives, generatedObjectives)

    expect(merged).toHaveLength(1)
    expect(merged[0]?.id).toBe('obj-keep')
    expect(merged[0]?.status).toBe('in_progress')
    expect(merged[0]?.progressHistory).toHaveLength(1)
    expect(merged[0]?.completedSteps).toHaveLength(1)
    expect(merged[0]?.nextSteps).toEqual(['Etape restante'])
    expect(merged[0]?.description).toBe('Nouvelle description')
  })

  it('uses generated steps when the matched objective has no pending steps left', () => {
    const merged = mergeObjectivesOnRefresh(
      [
        {
          ...existingObjectives[0]!,
          nextSteps: [],
        },
      ],
      generatedObjectives,
    )

    expect(merged[0]?.nextSteps).toEqual(['Nouvelle etape 1', 'Nouvelle etape 2'])
  })
})
