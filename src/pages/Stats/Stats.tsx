import { Navigate } from 'react-router-dom'
import { useMemo, useState, type CSSProperties } from 'react'
import statsPageData from '../../data/statsPageData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { StatsPeriod, WellbeingMetric } from '../../types/stats.types'
import { buildStatsSnapshot, formatAverageScore } from '../../utils/statsMetrics'
import './Stats.css'

type ObjectiveSegmentKey = 'done' | 'inProgress' | 'todo'

type StatsPeriodPickerProps = {
  value: StatsPeriod
  onChange: (period: StatsPeriod) => void
}

function StatsPeriodPicker({ value, onChange }: StatsPeriodPickerProps) {
  return (
    <div className="stats-period-picker" role="group" aria-label="Période">
      {statsPageData.periods.map((period) => (
        <button
          key={period.id}
          type="button"
          className={
            value === period.id ? 'stats-period-btn stats-period-btn-active' : 'stats-period-btn'
          }
          aria-pressed={value === period.id}
          onClick={() => onChange(period.id as StatsPeriod)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

function Stats() {
  const { state, weeklyInsight } = useCapClairState()
  const [period, setPeriod] = useState<StatsPeriod>('30d')
  const [wellbeingMetric, setWellbeingMetric] = useState<WellbeingMetric>('mood')
  const [activeSegment, setActiveSegment] = useState<ObjectiveSegmentKey | null>(null)

  const snapshot = useMemo(
    () =>
      buildStatsSnapshot({
        objectives: state.objectives,
        journal: state.journal,
        actionHistory: state.actionHistory,
        period,
      }),
    [state.actionHistory, state.journal, state.objectives, period],
  )

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  const { objectiveBreakdown, wellbeing, wellbeingTrend, activityDays } = snapshot
  const objectiveTotal = Math.max(objectiveBreakdown.total, 1)
  const maxActivityTotal = Math.max(...activityDays.map((day) => day.total), 1)
  const maxTrendValue = Math.max(
    ...wellbeingTrend.map((point) => (wellbeingMetric === 'mood' ? point.mood : point.energy)),
    1,
  )

  const objectiveSegments: Array<{
    key: ObjectiveSegmentKey
    label: string
    count: number
    className: string
  }> = [
    {
      key: 'done',
      label: statsPageData.objectiveLabels.done,
      count: objectiveBreakdown.done,
      className: 'stats-objective-segment-done',
    },
    {
      key: 'inProgress',
      label: statsPageData.objectiveLabels.inProgress,
      count: objectiveBreakdown.inProgress,
      className: 'stats-objective-segment-progress',
    },
    {
      key: 'todo',
      label: statsPageData.objectiveLabels.todo,
      count: objectiveBreakdown.todo,
      className: 'stats-objective-segment-todo',
    },
  ]

  const kpiCards = [
    {
      key: 'progress',
      label: statsPageData.kpi.progress,
      value: `${objectiveBreakdown.progressPercent}%`,
      hint: `${objectiveBreakdown.done}/${objectiveBreakdown.total} objectifs`,
      accent: 'primary',
    },
    {
      key: 'actions',
      label: statsPageData.kpi.actions,
      value: `${snapshot.actionsInPeriod + snapshot.completedStepsInPeriod}`,
      hint: `${snapshot.actionsInPeriod} actions · ${snapshot.completedStepsInPeriod} étapes`,
      accent: 'success',
    },
    {
      key: 'journal',
      label: statsPageData.kpi.journal,
      value: `${snapshot.journalEntriesInPeriod}`,
      hint:
        wellbeing.entryCount > 0
          ? `Humeur ${formatAverageScore(wellbeing.moodAverage)}`
          : statsPageData.empty.wellbeing,
      accent: 'warning',
    },
    {
      key: 'streak',
      label: statsPageData.kpi.streak,
      value: `${snapshot.activeStreak}`,
      hint: snapshot.activeStreak === 1 ? 'jour consécutif' : 'jours consécutifs',
      accent: 'insight',
    },
  ]

  return (
    <section className="stats">
      <header className="page-hero stats-hero">
        <div className="stats-hero-copy">
          <p className="chip chip-accent">Mesure & impulsion</p>
          <h1>Statistiques et progression</h1>
          <p className="page-subtitle">
            Visualise ta dynamique pour garder le cap sur ce qui fonctionne vraiment.
          </p>
        </div>
        <StatsPeriodPicker value={period} onChange={setPeriod} />
      </header>

      <div className="stats-kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.key} className={`stats-kpi-card stats-kpi-card-${card.accent}`}>
            <p className="stats-kpi-label">{card.label}</p>
            <strong className="stats-kpi-value">{card.value}</strong>
            <span className="stats-kpi-hint">{card.hint}</span>
          </article>
        ))}
      </div>

      <article className="stats-insight-card">
        <header className="stats-card-header">
          <span className="stats-card-icon" aria-hidden="true">
            ✦
          </span>
          <div>
            <h2>{statsPageData.sections.insightTitle}</h2>
            <p>{weeklyInsight}</p>
          </div>
        </header>
      </article>

      <div className="stats-panels">
        <article className="stats-panel stats-panel-objectives">
          <header className="stats-panel-head">
            <h2>{statsPageData.sections.objectivesTitle}</h2>
            <p>{statsPageData.sections.objectivesHint}</p>
          </header>

          <div className="stats-objective-layout">
            <div
              className="stats-progress-ring"
              style={{ '--stats-progress': `${objectiveBreakdown.progressPercent}` } as CSSProperties}
              aria-hidden="true"
            >
              <span>{objectiveBreakdown.progressPercent}%</span>
            </div>

            <div className="stats-objective-breakdown">
              <div className="stats-objective-stack" role="img" aria-label="Répartition des objectifs">
                {objectiveSegments.map((segment) => {
                  const width = Math.round((segment.count / objectiveTotal) * 100)
                  if (width <= 0) {
                    return null
                  }

                  return (
                    <button
                      key={segment.key}
                      type="button"
                      className={`stats-objective-segment ${segment.className} ${
                        activeSegment === segment.key ? 'stats-objective-segment-active' : ''
                      }`}
                      style={{ width: `${width}%` }}
                      aria-pressed={activeSegment === segment.key}
                      onMouseEnter={() => setActiveSegment(segment.key)}
                      onMouseLeave={() => setActiveSegment(null)}
                      onFocus={() => setActiveSegment(segment.key)}
                      onBlur={() => setActiveSegment(null)}
                    >
                      <span className="sr-only">
                        {segment.label} : {segment.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <ul className="stats-objective-legend">
                {objectiveSegments.map((segment) => (
                  <li
                    key={segment.key}
                    className={
                      activeSegment === segment.key ? 'stats-objective-legend-item-active' : ''
                    }
                  >
                    <span className={`stats-objective-dot ${segment.className}`} aria-hidden="true" />
                    <span>{segment.label}</span>
                    <strong>{segment.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="stats-panel stats-panel-wellbeing">
          <header className="stats-panel-head">
            <h2>{statsPageData.sections.wellbeingTitle}</h2>
            <p>{statsPageData.sections.wellbeingHint}</p>
          </header>

          <div className="stats-wellbeing-metrics">
            <div className="stats-wellbeing-card">
              <span className="stats-wellbeing-label">{statsPageData.wellbeingLabels.mood}</span>
              <span className="stats-stat" data-level={wellbeing.moodLevel}>
                {formatAverageScore(wellbeing.moodAverage)}
              </span>
              <div className="stats-wellbeing-track" aria-hidden="true">
                <span
                  className="stats-wellbeing-fill stats-wellbeing-fill-mood"
                  style={{ width: `${(wellbeing.moodAverage / 5) * 100}%` }}
                />
              </div>
            </div>
            <div className="stats-wellbeing-card">
              <span className="stats-wellbeing-label">{statsPageData.wellbeingLabels.energy}</span>
              <span className="stats-stat" data-level={wellbeing.energyLevel}>
                {formatAverageScore(wellbeing.energyAverage)}
              </span>
              <div className="stats-wellbeing-track" aria-hidden="true">
                <span
                  className="stats-wellbeing-fill stats-wellbeing-fill-energy"
                  style={{ width: `${(wellbeing.energyAverage / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="stats-trend">
            <div className="stats-trend-head">
              <h3>{statsPageData.sections.trendTitle}</h3>
              <div className="stats-metric-toggle" role="group" aria-label="Métrique de tendance">
                <button
                  type="button"
                  className={
                    wellbeingMetric === 'mood'
                      ? 'stats-metric-btn stats-metric-btn-active'
                      : 'stats-metric-btn'
                  }
                  aria-pressed={wellbeingMetric === 'mood'}
                  onClick={() => setWellbeingMetric('mood')}
                >
                  {statsPageData.wellbeingLabels.mood}
                </button>
                <button
                  type="button"
                  className={
                    wellbeingMetric === 'energy'
                      ? 'stats-metric-btn stats-metric-btn-active'
                      : 'stats-metric-btn'
                  }
                  aria-pressed={wellbeingMetric === 'energy'}
                  onClick={() => setWellbeingMetric('energy')}
                >
                  {statsPageData.wellbeingLabels.energy}
                </button>
              </div>
            </div>

            {wellbeingTrend.length > 0 ? (
              <div className="stats-trend-chart" role="list" aria-label="Tendance journal">
                {wellbeingTrend.map((point) => {
                  const value = wellbeingMetric === 'mood' ? point.mood : point.energy
                  const height = Math.round((value / maxTrendValue) * 100)

                  return (
                    <div key={point.id} className="stats-trend-bar-wrap" role="listitem">
                      <div className="stats-trend-bar-shell">
                        <div
                          className={`stats-trend-bar stats-trend-bar-${wellbeingMetric}`}
                          data-level={value}
                          style={{ height: `${height}%` }}
                          title={`${point.label} : ${value}/5`}
                        />
                      </div>
                      <span className="stats-trend-label">{point.label}</span>
                      <span className="stats-trend-value">{value}/5</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="stats-empty">{statsPageData.empty.journalTrend}</p>
            )}
          </div>
        </article>
      </div>

      <article className="stats-panel stats-panel-activity">
        <header className="stats-panel-head">
          <h2>{statsPageData.sections.activityTitle}</h2>
          <p>{statsPageData.sections.activityHint}</p>
        </header>

        {activityDays.some((day) => day.total > 0) ? (
          <div className="stats-activity-grid" role="list" aria-label="Activité quotidienne">
            {activityDays.map((day) => {
              const intensity = Math.max(1, Math.round((day.total / maxActivityTotal) * 5))

              return (
                <div
                  key={day.dateKey}
                  className="stats-activity-day"
                  data-intensity={intensity}
                  role="listitem"
                  title={`${day.label} · ${day.journalCount} journal · ${day.actionCount} actions`}
                >
                  <span className="stats-activity-count">{day.total > 0 ? day.total : '·'}</span>
                  <span className="stats-activity-label">{day.label}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="stats-empty">{statsPageData.empty.activity}</p>
        )}
      </article>
    </section>
  )
}

export default Stats
