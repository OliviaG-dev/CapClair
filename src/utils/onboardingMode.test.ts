import { describe, expect, it } from 'vitest'
import {
  buildInitialAnswers,
  getQuestionsForMode,
  resolveOnboardingMode,
} from './onboardingMode'

const fullQuestions = [
  { key: 'changeWish' as const, label: 'Full 1' },
  { key: 'blockingFactor' as const, label: 'Full 2' },
]

const refreshQuestions = [{ key: 'changeWish' as const, label: 'Refresh 1' }]

const emptyAnswers = {
  changeWish: '',
  heaviestWeight: '',
  improvementFocus: '',
  blockingFactor: '',
  energySource: '',
  progressVision: '',
}

describe('onboardingMode utils', () => {
  it('resolves refresh mode from search param', () => {
    expect(resolveOnboardingMode('refresh')).toBe('refresh')
    expect(resolveOnboardingMode('full')).toBe('full')
    expect(resolveOnboardingMode(null)).toBe('full')
  })

  it('returns refresh questions in refresh mode', () => {
    expect(getQuestionsForMode('refresh', fullQuestions, refreshQuestions)).toEqual(refreshQuestions)
    expect(getQuestionsForMode('full', fullQuestions, refreshQuestions)).toEqual(fullQuestions)
  })

  it('prefills previous answers in refresh mode', () => {
    const initial = buildInitialAnswers(
      'refresh',
      {
        ...emptyAnswers,
        changeWish: 'Nouveau cap',
        blockingFactor: 'Le doute',
      },
      emptyAnswers,
    )

    expect(initial.changeWish).toBe('Nouveau cap')
    expect(initial.blockingFactor).toBe('Le doute')
    expect(initial.heaviestWeight).toBe('')
  })
})
