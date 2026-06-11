const shortDeadlineFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

export function formatDeadline(deadline: string): string {
  const trimmed = deadline.trim()
  if (!trimmed) {
    return deadline
  }

  const parsed = new Date(`${trimmed}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return deadline
  }

  return shortDeadlineFormatter.format(parsed)
}
