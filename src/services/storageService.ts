import type { AppState } from '../types/capclair.types'

const STORAGE_KEY = 'capclair-state-v1'

const initialState: AppState = {
  answers: null,
  synthesis: null,
  objectives: [],
  journal: [],
}

export function getInitialState(): AppState {
  return initialState
}

export function loadState(): AppState {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return initialState
    }

    const parsedValue = JSON.parse(rawValue) as AppState
    return {
      answers: parsedValue.answers ?? null,
      synthesis: parsedValue.synthesis ?? null,
      objectives: parsedValue.objectives ?? [],
      journal: parsedValue.journal ?? [],
    }
  } catch (error) {
    console.error('Unable to read CapClair state from localStorage', error)
    return initialState
  }
}

export function persistState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Unable to persist CapClair state in localStorage', error)
  }
}
