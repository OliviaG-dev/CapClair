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
      <header className="page-hero">
        <p className="chip chip-accent">Déclic clarté</p>
        <h1>Ce que ton parcours met en lumiere</h1>
        <p className="page-subtitle">
          Voici une synthèse bienveillante pour t’aider à transformer ton ressenti en plan concret.
        </p>
      </header>
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
            {state.synthesis.importantThemes.map((theme, index) => (
              <li key={`${theme}-${index}`}>{theme}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Tes premieres pistes d objectifs</h2>
          <ul>
            {state.synthesis.suggestedGoals.map((goal, index) => (
              <li key={`${goal}-${index}`}>{goal}</li>
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
