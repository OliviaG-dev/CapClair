import { describe, expect, it } from 'vitest'
import { buildWeeklyInsight, generateObjectives, generateSynthesis } from './aiCoachService'
import type { AppState, QuestionnaireAnswers } from '../types/capclair.types'

describe('aiCoachService', () => {
  it('generates a synthesis from onboarding answers', () => {
    const answers: QuestionnaireAnswers = {
      changeWish: 'Retrouver un meilleur rythme',
      heaviestWeight: 'Je me sens surchargee',
      improvementFocus: 'Mieux organiser ma semaine',
      blockingFactor: 'Je manque de clarte',
      energySource: 'Faire de petites actions',
      progressVision: 'Avoir avance sur un objectif principal',
    }

    const synthesis = generateSynthesis(answers)

    expect(synthesis.wantsToChange).toBe(answers.changeWish)
    expect(synthesis.blockers).toBe(answers.blockingFactor)
    expect(synthesis.suggestedGoals).toHaveLength(3)
    expect(synthesis.firstAction.length).toBeGreaterThan(0)
  })

  it('generates 3 objectives with expected statuses', () => {
    const synthesis = generateSynthesis({
      changeWish: 'Trouver une direction',
      heaviestWeight: 'Le flou',
      improvementFocus: 'La regularite',
      blockingFactor: 'Le manque de plan',
      energySource: 'Les petites victoires',
      progressVision: 'Avoir une routine claire',
    })

    const objectives = generateObjectives(synthesis)

    expect(objectives).toHaveLength(3)
    expect(objectives[0].status).toBe('in_progress')
    expect(objectives[1].status).toBe('todo')
    expect(objectives[2].status).toBe('todo')
    expect(objectives.every((objective) => objective.nextSteps.length > 0)).toBe(true)
  })

  it('builds weekly insight depending on progress', () => {
    const baseState: AppState = {
      answers: null,
      synthesis: null,
      objectives: [],
      journal: [],
    }

    expect(buildWeeklyInsight(baseState)).toContain('Commence')

    const withDone: AppState = {
      ...baseState,
      objectives: [
        {
          id: '1',
          title: 'T',
          description: 'D',
          deepReason: 'R',
          obstacles: ['O'],
          motivation: 'M',
          nextSteps: ['N'],
          status: 'done',
          difficulty: 'easy',
          deadline: '2026-12-01',
          progressHistory: [],
        },
      ],
    }

    expect(buildWeeklyInsight(withDone)).toContain('1')
  })
})
