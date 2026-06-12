import { Link, Navigate } from 'react-router-dom'
import SynthesisSourceBadge from '../../components/SynthesisSourceBadge/SynthesisSourceBadge'
import handoffData from '../../data/handoffData.json'
import synthesisRefreshData from '../../data/synthesisRefreshData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import { findObjectiveForSuggestedGoal } from '../../utils/findObjectiveForSuggestedGoal'
import { splitTextIntoSentences } from '../../utils/splitTextIntoSentences'
import './Synthese.css'

type SynthesisCardTextProps = {
  text: string
}

function SynthesisCardText({ text }: SynthesisCardTextProps) {
  const sentences = splitTextIntoSentences(text)

  return (
    <div className="synthese-card-text">
      {sentences.map((sentence, index) => (
        <p key={`${sentence}-${index}`} className="synthese-card-line">
          {sentence}
        </p>
      ))}
    </div>
  )
}

function Synthese() {
  const { state } = useCapClairState()
  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <section className="synthese">
      <header className="page-hero">
        <p className="chip chip-accent">Déclic clarté</p>
        {state.synthesisSource ? <SynthesisSourceBadge source={state.synthesisSource} /> : null}
        <h1>Ce que ton parcours met en lumière</h1>
        <p className="page-subtitle">
          Voici une synthèse bienveillante pour t’aider à transformer ton ressenti en plan concret.
        </p>
      </header>
      <div className="synthese-grid">
        <article className="synthese-card synthese-card-change">
          <header className="synthese-card-header">
            <span className="synthese-card-badge">Intention</span>
            <h2>Ce que tu veux changer</h2>
          </header>
          <div className="synthese-card-body">
            <SynthesisCardText text={state.synthesis.wantsToChange} />
          </div>
        </article>

        <article className="synthese-card synthese-card-blockers">
          <header className="synthese-card-header">
            <span className="synthese-card-badge">Frein</span>
            <h2>Ce qui te bloque</h2>
          </header>
          <div className="synthese-card-body">
            <SynthesisCardText text={state.synthesis.blockers} />
          </div>
        </article>

        <article className="synthese-card synthese-card-themes">
          <header className="synthese-card-header">
            <span className="synthese-card-badge">Priorités</span>
            <h2>Ce qui semble important pour toi</h2>
          </header>
          <div className="synthese-card-body">
            <ul className="synthese-list">
              {state.synthesis.importantThemes.map((theme, index) => (
                <li key={`${theme}-${index}`} className="synthese-list-item">
                  <span className="synthese-list-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="synthese-list-text">{theme}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="synthese-card synthese-card-goals">
          <header className="synthese-card-header">
            <span className="synthese-card-badge">Pistes</span>
            <h2>
              Tes premières <span className="synthese-card-title-keep">pistes d&apos;objectifs</span>
            </h2>
          </header>
          <div className="synthese-card-body">
            <ul className="synthese-list">
              {state.synthesis.suggestedGoals.map((goal, index) => {
                const matchedObjective = findObjectiveForSuggestedGoal(
                  goal,
                  index,
                  state.objectives,
                )

                return (
                  <li key={`${goal}-${index}`} className="synthese-list-item synthese-goal-item">
                    <span className="synthese-list-index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="synthese-goal-copy">
                      <span className="synthese-list-text">{goal}</span>
                      {matchedObjective ? (
                        <Link
                          to={`/objectifs/${matchedObjective.id}`}
                          className="synthese-goal-link"
                        >
                          {handoffData.goalLinkLabel}
                        </Link>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </article>
      </div>

      <article className="first-action">
        <h2>Première action simple à faire aujourd&apos;hui</h2>
        <p>{state.synthesis.firstAction}</p>
      </article>

      {!state.handoffCompleted ? (
        <Link to="/handoff" className="primary-link">
          {handoffData.synthesisContinueLabel}
        </Link>
      ) : null}

      <aside className="synthese-refresh" aria-labelledby="synthese-refresh-title">
        <div className="synthese-refresh-main">
          <span className="synthese-refresh-icon" aria-hidden="true">
            ↻
          </span>
          <div className="synthese-refresh-copy">
            <span className="synthese-refresh-badge">{synthesisRefreshData.pillLabel}</span>
            <p id="synthese-refresh-title" className="synthese-refresh-title">
              {synthesisRefreshData.synthesisButtonLabel}
            </p>
            <p className="synthese-refresh-hint">{synthesisRefreshData.synthesisButtonHint}</p>
          </div>
        </div>
        <Link to="/onboarding?mode=refresh" className="synthese-refresh-link">
          {synthesisRefreshData.submitButton}
        </Link>
      </aside>
    </section>
  )
}

export default Synthese
