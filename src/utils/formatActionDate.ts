const actionDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatActionDate(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  return actionDateFormatter.format(parsed)
}

export function groupEntriesByDate<T extends { completedAt: string }>(
  entries: T[],
): Array<{ dateLabel: string; entries: T[] }> {
  const groups = new Map<string, T[]>()

  for (const entry of entries) {
    const dateLabel = formatActionDate(entry.completedAt)
    const currentGroup = groups.get(dateLabel) ?? []
    currentGroup.push(entry)
    groups.set(dateLabel, currentGroup)
  }

  return Array.from(groups.entries()).map(([dateLabel, groupedEntries]) => ({
    dateLabel,
    entries: groupedEntries,
  }))
}
