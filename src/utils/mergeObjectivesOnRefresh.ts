import type { Objective } from '../types/capclair.types'
import { findSimilarObjective } from './findSimilarObjective'

export function mergeObjectivesOnRefresh(
  existingObjectives: Objective[],
  generatedObjectives: Objective[],
): Objective[] {
  const usedIds = new Set<string>()

  return generatedObjectives.map((generatedObjective, index) => {
    const matchedObjective = findSimilarObjective(
      generatedObjective.title,
      index,
      existingObjectives,
      usedIds,
    )

    if (!matchedObjective) {
      return generatedObjective
    }

    usedIds.add(matchedObjective.id)

    const pendingSteps =
      findPendingSteps(matchedObjective.nextSteps).length > 0
        ? matchedObjective.nextSteps
        : generatedObjective.nextSteps

    return {
      ...generatedObjective,
      id: matchedObjective.id,
      status: matchedObjective.status,
      progressHistory: matchedObjective.progressHistory,
      completedSteps: matchedObjective.completedSteps,
      nextSteps: pendingSteps,
      deadline: matchedObjective.deadline,
    }
  })
}

function findPendingSteps(nextSteps: string[]): string[] {
  return nextSteps.filter((step) => step.trim().length > 0)
}
