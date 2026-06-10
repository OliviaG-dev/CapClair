import { describe, expect, it } from 'vitest'
import type { Objective } from '../types/capclair.types'
import { applyPrimaryObjectiveStatus, reconcileObjectiveUpdate } from './reconcileObjectiveUpdate'

const objectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'A',
    description: 'A',
    deepReason: 'R',
    obstacles: ['O'],
    motivation: 'M',
    nextSteps: ['N'],
    status: 'in_progress',
    difficulty: 'medium',
    deadline: '2026-12-31',
    progressHistory: [],
  },
  {
    id: 'obj-2',
    title: 'B',
    description: 'B',
    deepReason: 'R',
    obstacles: ['O'],
    motivation: 'M',
    nextSteps: ['N'],
    status: 'todo',
    difficulty: 'easy',
    deadline: '2026-12-31',
    progressHistory: [],
  },
  {
    id: 'obj-3',
    title: 'C',
    description: 'C',
    deepReason: 'R',
    obstacles: ['O'],
    motivation: 'M',
    nextSteps: ['N'],
    status: 'done',
    difficulty: 'hard',
    deadline: '2026-12-31',
    progressHistory: [],
  },
]

describe('reconcileObjectiveUpdate', () => {
  it('demotes other in-progress objectives when one becomes primary', () => {
    const updated = reconcileObjectiveUpdate(objectives, {
      ...objectives[1],
      status: 'in_progress',
    })

    expect(updated.find((objective) => objective.id === 'obj-1')?.status).toBe('todo')
    expect(updated.find((objective) => objective.id === 'obj-2')?.status).toBe('in_progress')
    expect(updated.find((objective) => objective.id === 'obj-3')?.status).toBe('done')
  })

  it('keeps other objectives unchanged when status is not in_progress', () => {
    const updated = reconcileObjectiveUpdate(objectives, {
      ...objectives[1],
      status: 'done',
    })

    expect(updated.find((objective) => objective.id === 'obj-1')?.status).toBe('in_progress')
    expect(updated.find((objective) => objective.id === 'obj-2')?.status).toBe('done')
  })
})

describe('applyPrimaryObjectiveStatus', () => {
  it('sets one objective in progress and preserves done status', () => {
    const updated = applyPrimaryObjectiveStatus(objectives, 'obj-2')

    expect(updated.find((objective) => objective.id === 'obj-1')?.status).toBe('todo')
    expect(updated.find((objective) => objective.id === 'obj-2')?.status).toBe('in_progress')
    expect(updated.find((objective) => objective.id === 'obj-3')?.status).toBe('done')
  })
})
