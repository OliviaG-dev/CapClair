import { describe, expect, it } from 'vitest'
import { mapObjectiveDraftsToObjectives } from './mapObjectiveDrafts'
import type { ObjectiveDraft } from '../types/capclair.types'

const baseDraft: ObjectiveDraft = {
  title: 'Mettre en place une routine de coucher',
  description: 'Un rythme stable t aidera a recuperer plus vite.',
  actionLabel: 'Clarifier',
  deepReason: 'Je veux retrouver un sommeil regulier.',
  obstacles: ['Ecrans tard le soir'],
  motivation: 'Je veux avancer vers plus de calme le matin.',
  nextSteps: ['Couper les ecrans a 22h', 'Preparer une alarme douce'],
  difficulty: 'medium',
}

describe('mapObjectiveDraftsToObjectives', () => {
  it('maps AI drafts into persisted objectives', () => {
    const objectives = mapObjectiveDraftsToObjectives([baseDraft])

    expect(objectives).toHaveLength(1)
    expect(objectives[0].title).toBe(baseDraft.title)
    expect(objectives[0].status).toBe('in_progress')
    expect(objectives[0].nextSteps).toEqual(baseDraft.nextSteps)
  })

  it('marks only the first objective as in progress', () => {
    const objectives = mapObjectiveDraftsToObjectives([
      baseDraft,
      { ...baseDraft, title: 'Planifier deux promenades par semaine', actionLabel: 'Renforcer' },
    ])

    expect(objectives[0].status).toBe('in_progress')
    expect(objectives[1].status).toBe('todo')
  })
})
