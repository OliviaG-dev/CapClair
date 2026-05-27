import { Link, Navigate } from 'react-router-dom'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Synthese.css'

function Synthese() {
  const { state } = useCapClairState()

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <section className="synthese">
      <h1>Ce que ton parcours met en lumiere</h1>
      <div className="synthese-grid">
        <article>
          <h2>Ce que tu veux changer</h2>
          <p>{state.synthesis.wantsToChange}</p>
        </article>
        <article>
          <h2>Ce qui te bloque</h2>
          <p>{state.synthesis.blockers}</p>
        </article>
        <article>
          <h2>Ce qui semble important pour toi</h2>
          <ul>
            {state.synthesis.importantThemes.map((theme) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Tes premieres pistes d objectifs</h2>
          <ul>
            {state.synthesis.suggestedGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="first-action">
        <h2>Premiere action simple a faire aujourd hui</h2>
        <p>{state.synthesis.firstAction}</p>
      </article>

      <Link to="/dashboard" className="primary-link">
        Aller au dashboard
      </Link>
    </section>
  )
}

export default Synthese
