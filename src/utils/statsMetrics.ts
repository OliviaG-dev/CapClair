import type {
  ActivityDay,
  ObjectiveBreakdown,
  StatsInput,
  StatsPeriod,
  StatsSnapshot,
  WellbeingSnapshot,
  WellbeingTrendPoint,
} from '../types/stats.types'

const TREND_POINT_LIMIT = 7
const ACTIVITY_DAY_LIMIT = 14
const MS_PER_DAY = 86_400_000

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

export function getPeriodStartDate(period: StatsPeriod, referenceDate = new Date()): Date | null {
  if (period === 'all') {
    return null
  }

  const dayCount = period === '7d' ? 7 : 30
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (dayCount - 1))
  return start
}

export function isWithinPeriod(
  isoDate: string,
  period: StatsPeriod,
  referenceDate = new Date(),
): boolean {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }

  const periodStart = getPeriodStartDate(period, referenceDate)
  if (!periodStart) {
    return parsed <= referenceDate
  }

  return parsed >= periodStart && parsed <= referenceDate
}

export function toDateKey(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function computeObjectiveBreakdown(objectives: StatsInput['objectives']): ObjectiveBreakdown {
  const done = objectives.filter((objective) => objective.status === 'done').length
  const inProgress = objectives.filter((objective) => objective.status === 'in_progress').length
  const todo = objectives.filter((objective) => objective.status === 'todo').length
  const total = objectives.length
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0

  return { done, inProgress, todo, total, progressPercent }
}

function averageMetric(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function roundToLevel(value: number): number {
  if (value <= 0) {
    return 1
  }

  return Math.min(5, Math.max(1, Math.round(value)))
}

export function computeWellbeingSnapshot(
  journal: StatsInput['journal'],
  period: StatsPeriod,
  referenceDate = new Date(),
): WellbeingSnapshot {
  const entriesInPeriod = journal.filter((entry) =>
    isWithinPeriod(entry.createdAt, period, referenceDate),
  )
  const moods = entriesInPeriod.map((entry) => entry.mood)
  const energies = entriesInPeriod.map((entry) => entry.energy)
  const moodAverage = averageMetric(moods)
  const energyAverage = averageMetric(energies)

  return {
    moodAverage,
    energyAverage,
    moodLevel: roundToLevel(moodAverage),
    energyLevel: roundToLevel(energyAverage),
    entryCount: entriesInPeriod.length,
  }
}

export function buildWellbeingTrend(
  journal: StatsInput['journal'],
  period: StatsPeriod,
  referenceDate = new Date(),
): WellbeingTrendPoint[] {
  return journal
    .filter((entry) => isWithinPeriod(entry.createdAt, period, referenceDate))
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .slice(-TREND_POINT_LIMIT)
    .map((entry) => ({
      id: entry.id,
      label: shortDateFormatter.format(new Date(entry.createdAt)),
      mood: entry.mood,
      energy: entry.energy,
    }))
}

export function countActionsInPeriod(
  actionHistory: StatsInput['actionHistory'],
  period: StatsPeriod,
  referenceDate = new Date(),
): number {
  return actionHistory.filter((entry) =>
    isWithinPeriod(entry.completedAt, period, referenceDate),
  ).length
}

export function countCompletedStepsInPeriod(
  objectives: StatsInput['objectives'],
  period: StatsPeriod,
  referenceDate = new Date(),
): number {
  return objectives.reduce((total, objective) => {
    const stepsInPeriod = objective.completedSteps.filter((step) =>
      isWithinPeriod(step.completedAt, period, referenceDate),
    ).length
    return total + stepsInPeriod
  }, 0)
}

export function computeActiveStreak(
  journal: StatsInput['journal'],
  actionHistory: StatsInput['actionHistory'],
  referenceDate = new Date(),
): number {
  const activeDays = new Set<string>()

  for (const entry of journal) {
    activeDays.add(toDateKey(entry.createdAt))
  }

  for (const entry of actionHistory) {
    activeDays.add(toDateKey(entry.completedAt))
  }

  let streak = 0
  const cursor = new Date(referenceDate)
  cursor.setHours(0, 0, 0, 0)

  while (activeDays.has(toDateKey(cursor.toISOString()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function buildActivityDays(
  journal: StatsInput['journal'],
  actionHistory: StatsInput['actionHistory'],
  period: StatsPeriod,
  referenceDate = new Date(),
): ActivityDay[] {
  const periodStart = getPeriodStartDate(period, referenceDate)
  const start = periodStart ?? new Date(referenceDate.getTime() - (ACTIVITY_DAY_LIMIT - 1) * MS_PER_DAY)
  start.setHours(0, 0, 0, 0)

  const end = new Date(referenceDate)
  end.setHours(0, 0, 0, 0)

  const daySpan =
    Math.min(
      ACTIVITY_DAY_LIMIT,
      Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1,
    ) || 1

  const windowStart = new Date(end)
  windowStart.setDate(windowStart.getDate() - (daySpan - 1))

  const journalByDay = new Map<string, number>()
  const actionsByDay = new Map<string, number>()

  for (const entry of journal) {
    if (!isWithinPeriod(entry.createdAt, period, referenceDate)) {
      continue
    }

    const key = toDateKey(entry.createdAt)
    journalByDay.set(key, (journalByDay.get(key) ?? 0) + 1)
  }

  for (const entry of actionHistory) {
    if (!isWithinPeriod(entry.completedAt, period, referenceDate)) {
      continue
    }

    const key = toDateKey(entry.completedAt)
    actionsByDay.set(key, (actionsByDay.get(key) ?? 0) + 1)
  }

  const days: ActivityDay[] = []

  for (let offset = 0; offset < daySpan; offset += 1) {
    const current = new Date(windowStart)
    current.setDate(windowStart.getDate() + offset)
    const dateKey = toDateKey(current.toISOString())
    const journalCount = journalByDay.get(dateKey) ?? 0
    const actionCount = actionsByDay.get(dateKey) ?? 0

    days.push({
      dateKey,
      label: shortDateFormatter.format(current),
      journalCount,
      actionCount,
      total: journalCount + actionCount,
    })
  }

  return days
}

export function buildStatsSnapshot(input: StatsInput): StatsSnapshot {
  const referenceDate = input.referenceDate ?? new Date()
  const objectiveBreakdown = computeObjectiveBreakdown(input.objectives)
  const wellbeing = computeWellbeingSnapshot(input.journal, input.period, referenceDate)

  return {
    objectiveBreakdown,
    wellbeing,
    wellbeingTrend: buildWellbeingTrend(input.journal, input.period, referenceDate),
    journalEntriesInPeriod: wellbeing.entryCount,
    actionsInPeriod: countActionsInPeriod(input.actionHistory, input.period, referenceDate),
    completedStepsInPeriod: countCompletedStepsInPeriod(
      input.objectives,
      input.period,
      referenceDate,
    ),
    activeStreak: computeActiveStreak(input.journal, input.actionHistory, referenceDate),
    activityDays: buildActivityDays(
      input.journal,
      input.actionHistory,
      input.period,
      referenceDate,
    ),
  }
}

export function formatAverageScore(value: number): string {
  if (value <= 0) {
    return '—'
  }

  return `${value.toFixed(1)}/5`
}
