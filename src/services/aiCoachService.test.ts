import { describe, expect, it } from 'vitest'
import { buildWeeklyInsight, generateObjectives, generateSynthesis, resolveOnboardingGeneration } from './aiCoachService'
import type { AppState, ObjectiveDraft, QuestionnaireAnswers } from '../types/capclair.types'

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
    expect(synthesis.suggestedGoals.length).toBeGreaterThan(0)
    expect(synthesis.firstAction.length).toBeGreaterThan(0)
  })

  it('generates one objective per sentence', () => {
    const synthesis = generateSynthesis({
      changeWish: 'Je veux retrouver un sommeil régulier. Je veux moins stresser.',
      heaviestWeight: 'La fatigue',
      improvementFocus: 'Le repos',
      blockingFactor: 'Les écrans tard le soir.',
      energySource: 'Les promenades courtes.',
      progressVision: 'Dormir mieux',
    })

    const objectives = generateObjectives(synthesis)

    expect(objectives.length).toBeGreaterThan(3)
    expect(objectives[0].status).toBe('in_progress')
    expect(objectives.slice(1).every((objective) => objective.status === 'todo')).toBe(true)
    expect(objectives.every((objective) => objective.title === objective.description)).toBe(true)
    expect(objectives.every((objective) => objective.nextSteps.length === 1)).toBe(true)
    expect(objectives[0].title).toBe('Retrouver un sommeil régulier')
  })

  it('uses AI objectives when generation override provides them', () => {
    const answers: QuestionnaireAnswers = {
      changeWish: 'Retrouver un meilleur rythme',
      heaviestWeight: 'Je me sens surchargee',
      improvementFocus: 'Mieux organiser ma semaine',
      blockingFactor: 'Je manque de clarte',
      energySource: 'Faire de petites actions',
      progressVision: 'Avoir avance sur un objectif principal',
    }

    const synthesis = generateSynthesis(answers)
    const aiObjectives: ObjectiveDraft[] = [
      {
        title: 'Bloquer 15 minutes chaque matin pour prioriser',
        description: 'Commencer la journee avec une intention claire.',
        actionLabel: 'Prioriser',
        deepReason: synthesis.wantsToChange,
        obstacles: [synthesis.blockers],
        motivation: 'Avancer sans surcharge mentale.',
        nextSteps: ['Choisir 1 priorite', 'La noter sur papier'],
        difficulty: 'easy',
      },
      {
        title: 'Agir sur le manque de clarte avec un mini-plan hebdo',
        description: 'Un plan court reduit le flou.',
        actionLabel: 'Agir sur',
        deepReason: synthesis.wantsToChange,
        obstacles: [synthesis.blockers],
        motivation: 'Retrouver du mouvement concret.',
        nextSteps: ['Lister 3 taches', 'Planifier la premiere'],
        difficulty: 'medium',
      },
      {
        title: 'Renforcer une habitude energisante de 10 minutes',
        description: 'Une source d energie simple aide a tenir.',
        actionLabel: 'Renforcer',
        deepReason: synthesis.wantsToChange,
        obstacles: ['Fatigue en fin de journee'],
        motivation: 'Garder un rythme realiste.',
        nextSteps: ['Choisir l habitude', 'La placer apres le dejeuner'],
        difficulty: 'easy',
      },
    ]

    const resolved = resolveOnboardingGeneration(answers, { synthesis, objectives: aiObjectives })

    expect(resolved.objectives).toHaveLength(3)
    expect(resolved.objectives[0].title).toBe(aiObjectives[0].title)
    expect(resolved.objectives[0].nextSteps).toHaveLength(2)
    expect(resolved.objectives[0].description).not.toBe(resolved.objectives[0].title)
  })

  it('builds weekly insight depending on progress', () => {
    const baseState: AppState = {
      answers: null,
      synthesis: null,
      objectives: [],
      journal: [],
      handoffCompleted: false,
      synthesisSource: null,
      actionHistory: [],
      completedSynthesisFirstAction: false,
    }

    expect(buildWeeklyInsight(baseState)).toContain('Commence')

    const withDone: AppState = {
      ...baseState,
      objectives: [
        {
          id: '1',
          title: 'T',
          description: 'T',
          deepReason: 'R',
          obstacles: ['O'],
          motivation: 'M',
          nextSteps: ['N'],
          completedSteps: [],
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
