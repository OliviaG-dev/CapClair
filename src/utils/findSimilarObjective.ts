import type { Objective } from '../types/capclair.types'

const normalizeText = (value: string): string => value.trim().toLowerCase()

export function findSimilarObjective(
  title: string,
  index: number,
  objectives: Objective[],
  excludedIds: Set<string> = new Set(),
): Objective | undefined {
  const availableObjectives = objectives.filter((objective) => !excludedIds.has(objective.id))

  if (availableObjectives.length === 0) {
    return undefined
  }

  const normalizedTitle = normalizeText(title)

  const exactMatch = availableObjectives.find(
    (objective) => normalizeText(objective.title) === normalizedTitle,
  )
  if (exactMatch) {
    return exactMatch
  }

  const objectiveAtIndex = availableObjectives[index]
  if (objectiveAtIndex) {
    return objectiveAtIndex
  }

  return availableObjectives.find((objective) => {
    const normalizedObjectiveTitle = normalizeText(objective.title)
    return (
      normalizedObjectiveTitle.includes(normalizedTitle) ||
      normalizedTitle.includes(normalizedObjectiveTitle)
    )
  })
}
