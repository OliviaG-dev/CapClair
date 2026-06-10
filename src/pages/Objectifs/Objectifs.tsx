import { Navigate } from 'react-router-dom'
import ObjectiveCard from '../../components/ObjectiveCard/ObjectiveCard'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Objectifs.css'

function Objectifs() {
  const { state } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <section className="objectifs">
      <header className="page-hero">
        <p className="chip chip-accent">Plan d’action</p>
        <h1>Mon plan</h1>
        <p className="page-subtitle">
          Clarifie, découpe et fais avancer chaque objectif à ton rythme avec des pas mesurables.
        </p>
      </header>
      <div className="objective-grid">
        {state.objectives.map((objective) => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>
    </section>
  )
}

export default Objectifs
