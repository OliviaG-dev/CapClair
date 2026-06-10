import type { Objective } from '../types/capclair.types'

export function applyPrimaryObjectiveStatus(
  objectives: Objective[],
  primaryObjectiveId: string,
): Objective[] {
  return objectives.map((objective) => ({
    ...objective,
    status:
      objective.id === primaryObjectiveId
        ? 'in_progress'
        : objective.status === 'done'
          ? 'done'
          : 'todo',
  }))
}

export function reconcileObjectiveUpdate(
  objectives: Objective[],
  updatedObjective: Objective,
): Objective[] {
  if (updatedObjective.status !== 'in_progress') {
    return objectives.map((objective) =>
      objective.id === updatedObjective.id ? updatedObjective : objective,
    )
  }

  return objectives.map((objective) => {
    if (objective.id === updatedObjective.id) {
      return updatedObjective
    }

    if (objective.status === 'in_progress') {
      return { ...objective, status: 'todo' }
    }

    return objective
  })
}
