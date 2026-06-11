import { Navigate } from 'react-router-dom'
import DailyActionCard from '../../components/DailyActionCard/DailyActionCard'
import KpiCard from '../../components/KpiCard/KpiCard'
import ObjectiveCard from '../../components/ObjectiveCard/ObjectiveCard'
import { useCapClairState } from '../../hooks/useCapClairState'
import { resolveDailyAction } from '../../utils/resolveDailyAction'
import './Dashboard.css'

function Dashboard() {
  const { state, weeklyInsight, completeDailyAction } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  const doneCount = state.objectives.filter((objective) => objective.status === 'done').length
  const inProgressCount = state.objectives.filter(
    (objective) => objective.status === 'in_progress',
  ).length
  const progress = state.objectives.length
    ? Math.round((doneCount / state.objectives.length) * 100)
    : 0
  const averageEnergy =
    state.journal.length > 0
      ? (
          state.journal.reduce((sum, current) => sum + current.energy, 0) / state.journal.length
        ).toFixed(1)
      : 'N/A'
  const dailyAction = resolveDailyAction(state)

  return (
    <section className="dashboard">
      <header className="page-hero">
        <p className="chip chip-accent">Vue globale</p>
        <h1>Aujourd&apos;hui</h1>
        <p className="page-subtitle">
          Regarde ce qui avance vraiment, puis choisis la prochaine action la plus simple.
        </p>
      </header>

      {dailyAction ? (
        <DailyActionCard
          dailyAction={dailyAction}
          actionHistory={state.actionHistory}
          onComplete={completeDailyAction}
        />
      ) : null}

      <div className="kpi-grid">
        <KpiCard label="Objectifs en cours" value={`${inProgressCount}`} />
        <KpiCard label="Objectifs terminés" value={`${doneCount}`} />
        <KpiCard label="Progression globale" value={`${progress}%`} />
        <KpiCard label="Énergie moyenne" value={`${averageEnergy}`} />
      </div>

      <article className="ai-summary">
        <h2>Lecture IA de ta semaine</h2>
        <p>{weeklyInsight}</p>
      </article>

      <div className="objective-grid">
        {state.objectives.map((objective) => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>
    </section>
  )
}

export default Dashboard
