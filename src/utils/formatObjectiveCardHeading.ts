import type { Objective } from '../types/capclair.types'

const LEGACY_TITLE_PATTERN = /^(Clarifier|Agir sur|Renforcer)\s*:\s*(.+)$/i

export function formatObjectiveCardHeading(objective: Objective): {
  actionLabel: string | null
  title: string
} {
  if (objective.actionLabel) {
    return {
      actionLabel: objective.actionLabel,
      title: objective.title,
    }
  }

  const legacyMatch = objective.title.match(LEGACY_TITLE_PATTERN)
  if (legacyMatch) {
    return {
      actionLabel: legacyMatch[1],
      title: legacyMatch[2].trim(),
    }
  }

  return {
    actionLabel: null,
    title: objective.title,
  }
}
