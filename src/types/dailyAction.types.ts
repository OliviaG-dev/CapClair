export type DailyActionSource = 'in_progress_step' | 'synthesis' | 'all_done'

export type DailyAction = {
  text: string
  source: DailyActionSource
  objectiveId?: string
  objectiveTitle?: string
}
