import type { AppState, Objective } from '../types/capclair.types'

const STORAGE_KEY = 'capclair-state-v1'

const normalizeObjective = (objective: Partial<Objective>): Objective => ({
  id: objective.id ?? crypto.randomUUID(),
  title: objective.title ?? '',
  actionLabel: objective.actionLabel,
  description: objective.description ?? '',
  deepReason: objective.deepReason ?? '',
  obstacles: objective.obstacles ?? [],
  motivation: objective.motivation ?? '',
  nextSteps: objective.nextSteps ?? [],
  completedSteps: objective.completedSteps ?? [],
  status: objective.status ?? 'todo',
  difficulty: objective.difficulty ?? 'medium',
  deadline: objective.deadline ?? '',
  progressHistory: objective.progressHistory ?? [],
})

const initialState: AppState = {
  answers: null,
  synthesis: null,
  objectives: [],
  journal: [],
  handoffCompleted: false,
  actionHistory: [],
  completedSynthesisFirstAction: false,
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

    const parsedValue = JSON.parse(rawValue) as Partial<AppState>
    const hasLegacyCompletedSession =
      parsedValue.synthesis != null &&
      (parsedValue.handoffCompleted === undefined || parsedValue.handoffCompleted === null)

    return {
      answers: parsedValue.answers ?? null,
      synthesis: parsedValue.synthesis ?? null,
      objectives: (parsedValue.objectives ?? []).map((objective) =>
        normalizeObjective(objective as Partial<Objective>),
      ),
      journal: parsedValue.journal ?? [],
      handoffCompleted: hasLegacyCompletedSession ? true : (parsedValue.handoffCompleted ?? false),
      actionHistory: parsedValue.actionHistory ?? [],
      completedSynthesisFirstAction: parsedValue.completedSynthesisFirstAction ?? false,
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
