import type { ActionCompletionLog, JournalEntry, Objective } from './capclair.types'

export type StatsPeriod = '7d' | '30d' | 'all'

export type WellbeingMetric = 'mood' | 'energy'

export type ObjectiveBreakdown = {
  done: number
  inProgress: number
  todo: number
  total: number
  progressPercent: number
}

export type WellbeingSnapshot = {
  moodAverage: number
  energyAverage: number
  moodLevel: number
  energyLevel: number
  entryCount: number
}

export type WellbeingTrendPoint = {
  id: string
  label: string
  mood: number
  energy: number
}

export type ActivityDay = {
  dateKey: string
  label: string
  journalCount: number
  actionCount: number
  total: number
}

export type StatsSnapshot = {
  objectiveBreakdown: ObjectiveBreakdown
  wellbeing: WellbeingSnapshot
  wellbeingTrend: WellbeingTrendPoint[]
  journalEntriesInPeriod: number
  actionsInPeriod: number
  completedStepsInPeriod: number
  activeStreak: number
  activityDays: ActivityDay[]
}

export type StatsInput = {
  objectives: Objective[]
  journal: JournalEntry[]
  actionHistory: ActionCompletionLog[]
  period: StatsPeriod
  referenceDate?: Date
}
