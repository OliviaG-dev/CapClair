import { describe, expect, it } from 'vitest'
import type { AppState } from '../types/capclair.types'
import {
  buildStatsSnapshot,
  buildWellbeingTrend,
  computeActiveStreak,
  computeObjectiveBreakdown,
  computeWellbeingSnapshot,
  formatAverageScore,
  isWithinPeriod,
} from './statsMetrics'

const referenceDate = new Date('2026-06-10T18:00:00.000Z')

const baseObjectives: AppState['objectives'] = [
  {
    id: 'obj-1',
    title: 'Objectif A',
    description: 'Desc',
    deepReason: 'Raison',
    obstacles: [],
    motivation: 'Motivation',
    nextSteps: ['Step'],
    completedSteps: [
      { id: 's-1', text: 'Step done', completedAt: '2026-06-09T10:00:00.000Z' },
    ],
    status: 'done',
    difficulty: 'easy',
    deadline: '2026-12-31',
    progressHistory: [],
  },
  {
    id: 'obj-2',
    title: 'Objectif B',
    description: 'Desc',
    deepReason: 'Raison',
    obstacles: [],
    motivation: 'Motivation',
    nextSteps: ['Step'],
    completedSteps: [],
    status: 'in_progress',
    difficulty: 'medium',
    deadline: '2026-12-31',
    progressHistory: [],
  },
  {
    id: 'obj-3',
    title: 'Objectif C',
    description: 'Desc',
    deepReason: 'Raison',
    obstacles: [],
    motivation: 'Motivation',
    nextSteps: ['Step'],
    completedSteps: [],
    status: 'todo',
    difficulty: 'hard',
    deadline: '2026-12-31',
    progressHistory: [],
  },
]

const baseJournal: AppState['journal'] = [
  {
    id: 'j-1',
    createdAt: '2026-06-08T09:00:00.000Z',
    mood: 4,
    energy: 3,
    note: 'Note 1',
  },
  {
    id: 'j-2',
    createdAt: '2026-06-10T09:00:00.000Z',
    mood: 5,
    energy: 4,
    note: 'Note 2',
  },
]

const baseActionHistory: AppState['actionHistory'] = [
  {
    id: 'a-1',
    text: 'Action faite',
    completedAt: '2026-06-10T11:00:00.000Z',
    source: 'synthesis',
  },
]

describe('statsMetrics', () => {
  it('computes objective breakdown and progress percent', () => {
    expect(computeObjectiveBreakdown(baseObjectives)).toEqual({
      done: 1,
      inProgress: 1,
      todo: 1,
      total: 3,
      progressPercent: 33,
    })
  })

  it('filters entries by selected period', () => {
    expect(isWithinPeriod('2026-06-10T09:00:00.000Z', '7d', referenceDate)).toBe(true)
    expect(isWithinPeriod('2026-05-01T09:00:00.000Z', '7d', referenceDate)).toBe(false)
    expect(isWithinPeriod('2026-05-01T09:00:00.000Z', 'all', referenceDate)).toBe(true)
  })

  it('builds snapshot with wellbeing averages and activity counts', () => {
    const snapshot = buildStatsSnapshot({
      objectives: baseObjectives,
      journal: baseJournal,
      actionHistory: baseActionHistory,
      period: '30d',
      referenceDate,
    })

    expect(snapshot.wellbeing.entryCount).toBe(2)
    expect(snapshot.wellbeing.moodAverage).toBe(4.5)
    expect(snapshot.wellbeing.energyAverage).toBe(3.5)
    expect(snapshot.actionsInPeriod).toBe(1)
    expect(snapshot.completedStepsInPeriod).toBe(1)
    expect(snapshot.wellbeingTrend).toHaveLength(2)
    expect(snapshot.activityDays.length).toBeGreaterThan(0)
  })

  it('computes active streak from journal and actions', () => {
    expect(computeActiveStreak(baseJournal, baseActionHistory, referenceDate)).toBe(1)
  })

  it('formats empty averages as dash', () => {
    expect(formatAverageScore(0)).toBe('—')
    expect(formatAverageScore(4.2)).toBe('4.2/5')
  })

  it('returns empty wellbeing snapshot when journal has no entries', () => {
    const wellbeing = computeWellbeingSnapshot([], '30d', referenceDate)

    expect(wellbeing).toEqual({
      moodAverage: 0,
      energyAverage: 0,
      moodLevel: 1,
      energyLevel: 1,
      entryCount: 0,
    })
    expect(formatAverageScore(wellbeing.moodAverage)).toBe('—')
  })

  it('returns zero progress when there are no objectives', () => {
    expect(computeObjectiveBreakdown([])).toEqual({
      done: 0,
      inProgress: 0,
      todo: 0,
      total: 0,
      progressPercent: 0,
    })
  })

  it('computes multi-day active streak', () => {
    const journal: AppState['journal'] = [
      {
        id: 'j-1',
        createdAt: '2026-06-08T09:00:00.000Z',
        mood: 3,
        energy: 3,
        note: 'Jour 1',
      },
      {
        id: 'j-2',
        createdAt: '2026-06-09T09:00:00.000Z',
        mood: 4,
        energy: 4,
        note: 'Jour 2',
      },
      {
        id: 'j-3',
        createdAt: '2026-06-10T09:00:00.000Z',
        mood: 5,
        energy: 5,
        note: 'Jour 3',
      },
    ]

    expect(computeActiveStreak(journal, [], referenceDate)).toBe(3)
  })

  it('keeps only the last seven journal points in wellbeing trend', () => {
    const journal: AppState['journal'] = Array.from({ length: 9 }, (_, index) => ({
      id: `j-${index + 1}`,
      createdAt: `2026-06-0${index + 1}T09:00:00.000Z`,
      mood: 3,
      energy: 3,
      note: `Note ${index + 1}`,
    }))

    const trend = buildWellbeingTrend(journal, 'all', new Date('2026-06-10T18:00:00.000Z'))

    expect(trend).toHaveLength(7)
    expect(trend.map((point) => point.id)).toEqual([
      'j-3',
      'j-4',
      'j-5',
      'j-6',
      'j-7',
      'j-8',
      'j-9',
    ])
  })

  it('filters snapshot counts by selected period', () => {
    const journal: AppState['journal'] = [
      {
        id: 'j-recent-1',
        createdAt: '2026-06-09T09:00:00.000Z',
        mood: 4,
        energy: 3,
        note: 'Recent 1',
      },
      {
        id: 'j-recent-2',
        createdAt: '2026-06-10T09:00:00.000Z',
        mood: 5,
        energy: 4,
        note: 'Recent 2',
      },
      {
        id: 'j-old',
        createdAt: '2026-05-01T09:00:00.000Z',
        mood: 2,
        energy: 2,
        note: 'Old',
      },
    ]

    const snapshot7d = buildStatsSnapshot({
      objectives: [],
      journal,
      actionHistory: [],
      period: '7d',
      referenceDate,
    })
    const snapshotAll = buildStatsSnapshot({
      objectives: [],
      journal,
      actionHistory: [],
      period: 'all',
      referenceDate,
    })

    expect(snapshot7d.journalEntriesInPeriod).toBe(2)
    expect(snapshotAll.journalEntriesInPeriod).toBe(3)
  })
})
