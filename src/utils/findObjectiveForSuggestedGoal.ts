import type { Objective } from '../types/capclair.types'

const normalizeText = (value: string): string => value.trim().toLowerCase()

export function findObjectiveForSuggestedGoal(
  suggestedGoal: string,
  index: number,
  objectives: Objective[],
): Objective | undefined {
  if (objectives.length === 0) {
    return undefined
  }

  const normalizedGoal = normalizeText(suggestedGoal)

  const exactMatch = objectives.find(
    (objective) => normalizeText(objective.title) === normalizedGoal,
  )
  if (exactMatch) {
    return exactMatch
  }

  const objectiveAtIndex = objectives[index]
  if (objectiveAtIndex) {
    return objectiveAtIndex
  }

  return objectives.find((objective) => {
    const normalizedTitle = normalizeText(objective.title)
    return (
      normalizedTitle.includes(normalizedGoal) || normalizedGoal.includes(normalizedTitle)
    )
  })
}
