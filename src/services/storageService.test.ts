import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getInitialState, loadState, persistState } from './storageService'

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial state when storage is empty', () => {
    const state = loadState()
    expect(state).toEqual(getInitialState())
  })

  it('persists and loads state from localStorage', () => {
    const payload = {
      answers: null,
      synthesis: {
        wantsToChange: 'Changer',
        blockers: 'Blocage',
        importantThemes: ['Theme'],
        suggestedGoals: ['Goal'],
        firstAction: 'Action',
      },
      objectives: [],
      journal: [],
    }

    persistState(payload)
    const loaded = loadState()

    expect(loaded).toEqual(payload)
  })

  it('returns initial state and logs when JSON is invalid', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem('capclair-state-v1', '{invalid-json')

    const loaded = loadState()

    expect(loaded).toEqual(getInitialState())
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
