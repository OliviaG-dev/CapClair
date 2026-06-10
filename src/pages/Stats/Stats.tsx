import { Navigate } from 'react-router-dom'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Stats.css'

function Stats() {
  const { state } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  const doneCount = state.objectives.filter((objective) => objective.status === 'done').length
  const inProgressCount = state.objectives.filter(
    (objective) => objective.status === 'in_progress',
  ).length
  const todoCount = state.objectives.filter((objective) => objective.status === 'todo').length
  const total = Math.max(state.objectives.length, 1)

  const moodAverage =
    state.journal.length > 0
      ? state.journal.reduce((sum, current) => sum + current.mood, 0) / state.journal.length
      : 0
  const energyAverage =
    state.journal.length > 0
      ? state.journal.reduce((sum, current) => sum + current.energy, 0) / state.journal.length
      : 0

  return (
    <section className="stats">
      <header className="page-hero">
        <p className="chip chip-accent">Mesure & impulsion</p>
        <h1>Statistiques et progression</h1>
        <p className="page-subtitle">
          Visualise ta dynamique pour garder le cap sur ce qui fonctionne vraiment.
        </p>
      </header>

      <article className="bars">
        <h2>Répartition des objectifs</h2>
        <div className="bar-row">
          <span>Terminés</span>
          <div className="bar-track">
            <div className="bar-done" style={{ width: `${Math.round((doneCount / total) * 100)}%` }} />
          </div>
          <strong>{doneCount}</strong>
        </div>
        <div className="bar-row">
          <span>En cours</span>
          <div className="bar-track">
            <div
              className="bar-progress"
              style={{ width: `${Math.round((inProgressCount / total) * 100)}%` }}
            />
          </div>
          <strong>{inProgressCount}</strong>
        </div>
        <div className="bar-row">
          <span>À lancer</span>
          <div className="bar-track">
            <div className="bar-todo" style={{ width: `${Math.round((todoCount / total) * 100)}%` }} />
          </div>
          <strong>{todoCount}</strong>
        </div>
      </article>

      <article className="mood-energy">
        <h2>Humeur et énergie moyennes</h2>
        <p>Humeur : {moodAverage.toFixed(1)}/5</p>
        <p>Énergie : {energyAverage.toFixed(1)}/5</p>
      </article>
    </section>
  )
}

export default Stats
