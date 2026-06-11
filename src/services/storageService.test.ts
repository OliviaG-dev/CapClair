import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppState } from '../types/capclair.types'
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
    const payload: AppState = {
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
      handoffCompleted: true,
      synthesisSource: 'local',
      actionHistory: [],
      completedSynthesisFirstAction: false,
    }

    persistState(payload)
    const loaded = loadState()

    expect(loaded).toEqual(payload)
  })

  it('migrates legacy sessions with synthesis to completed handoff', () => {
    const legacyPayload = {
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

    localStorage.setItem('capclair-state-v1', JSON.stringify(legacyPayload))
    expect(loadState().handoffCompleted).toBe(true)
    expect(loadState().synthesisSource).toBe('local')
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
