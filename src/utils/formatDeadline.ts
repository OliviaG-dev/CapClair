const deadlineFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

  return deadlineFormatter.format(parsed)
}
