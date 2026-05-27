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
      <h1>Objectifs / Progression</h1>
      <p>Clarifie, decoupe et fais avancer chaque objectif a ton rythme.</p>
      <div className="objective-grid">
        {state.objectives.map((objective) => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>
    </section>
  )
}

export default Objectifs
