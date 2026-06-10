import { describe, expect, it } from 'vitest'
import type { AppState } from '../types/capclair.types'
import { resolveDailyAction } from './resolveDailyAction'

const baseSynthesis = {
  wantsToChange: 'Avancer',
  blockers: 'Le flou',
  importantThemes: ['Travail'],
  suggestedGoals: ['Clarifier ma direction'],
  firstAction: 'Bloquer 15 minutes pour une action simple',
}

const baseState: AppState = {
  answers: null,
  synthesis: baseSynthesis,
  objectives: [],
  journal: [],
  handoffCompleted: true,
  actionHistory: [],
  completedSynthesisFirstAction: false,
}

describe('resolveDailyAction', () => {
  it('returns null when synthesis is missing', () => {
    expect(resolveDailyAction({ ...baseState, synthesis: null })).toBeNull()
  })

  it('prioritizes the first next step of the in-progress objective', () => {
    const action = resolveDailyAction({
      ...baseState,
      objectives: [
        {
          id: 'obj-1',
          title: 'Clarifier ma direction',
          description: 'Description',
          deepReason: 'Raison',
          obstacles: ['Obstacle'],
          motivation: 'Motivation',
          nextSteps: ['Planifier 20 minutes demain matin', 'Autre etape'],
          completedSteps: [],
          status: 'in_progress',
          difficulty: 'medium',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
    })

    expect(action).toEqual({
      text: 'Planifier 20 minutes demain matin',
      source: 'in_progress_step',
      objectiveId: 'obj-1',
      objectiveTitle: 'Clarifier ma direction',
    })
  })

  it('falls back to synthesis firstAction when no objective is in progress', () => {
    const action = resolveDailyAction({
      ...baseState,
      objectives: [
        {
          id: 'obj-1',
          title: 'Clarifier ma direction',
          description: 'Description',
          deepReason: 'Raison',
          obstacles: ['Obstacle'],
          motivation: 'Motivation',
          nextSteps: ['Etape ignoree'],
          completedSteps: [],
          status: 'todo',
          difficulty: 'medium',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
    })

    expect(action).toEqual({
      text: baseSynthesis.firstAction,
      source: 'synthesis',
    })
  })

  it('falls back to synthesis firstAction when in-progress objective has empty next steps', () => {
    const action = resolveDailyAction({
      ...baseState,
      objectives: [
        {
          id: 'obj-1',
          title: 'Clarifier ma direction',
          description: 'Description',
          deepReason: 'Raison',
          obstacles: ['Obstacle'],
          motivation: 'Motivation',
          nextSteps: ['', '   '],
          completedSteps: [],
          status: 'in_progress',
          difficulty: 'medium',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
    })

    expect(action?.source).toBe('synthesis')
    expect(action?.text).toBe(baseSynthesis.firstAction)
  })

  it('returns an all-done message when every objective is completed', () => {
    const action = resolveDailyAction({
      ...baseState,
      objectives: [
        {
          id: 'obj-1',
          title: 'Clarifier ma direction',
          description: 'Description',
          deepReason: 'Raison',
          obstacles: ['Obstacle'],
          motivation: 'Motivation',
          nextSteps: ['Etape'],
          completedSteps: [],
          status: 'done',
          difficulty: 'medium',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
    })

    expect(action?.source).toBe('all_done')
    expect(action?.text).toContain('terminés')
  })

  it('skips synthesis firstAction once it has been completed', () => {
    const action = resolveDailyAction({
      ...baseState,
      objectives: [],
      completedSynthesisFirstAction: true,
    })

    expect(action).toBeNull()
  })
})
