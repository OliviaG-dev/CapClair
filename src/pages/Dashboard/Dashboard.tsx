import { Navigate } from 'react-router-dom'
import KpiCard from '../../components/KpiCard/KpiCard'
import ObjectiveCard from '../../components/ObjectiveCard/ObjectiveCard'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Dashboard.css'

function Dashboard() {
  const { state, weeklyInsight } = useCapClairState()

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

  return (
    <section className="dashboard">
      <h1>Dashboard</h1>
      <div className="kpi-grid">
        <KpiCard label="Objectifs en cours" value={`${inProgressCount}`} />
        <KpiCard label="Objectifs termines" value={`${doneCount}`} />
        <KpiCard label="Progression globale" value={`${progress}%`} />
        <KpiCard label="Energie moyenne" value={`${averageEnergy}`} />
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
