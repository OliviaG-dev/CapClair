import type { Objective } from '../types/capclair.types'
import { findSimilarObjective } from './findSimilarObjective'

export function findObjectiveForSuggestedGoal(
  suggestedGoal: string,
  index: number,
  objectives: Objective[],
): Objective | undefined {
  if (objectives.length === 0) {
    return undefined
  }

  return findSimilarObjective(suggestedGoal, index, objectives)
}
