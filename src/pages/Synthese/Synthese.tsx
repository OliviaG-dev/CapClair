import { Link, Navigate } from 'react-router-dom'
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
  const continuePath = state.handoffCompleted ? '/dashboard' : '/handoff'
  const continueLabel = state.handoffCompleted
    ? handoffData.synthesisDashboardLabel
    : handoffData.synthesisContinueLabel

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <section className="synthese">
      <header className="page-hero">
        <p className="chip chip-accent">Déclic clarté</p>
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

      <Link to={continuePath} className="primary-link">
        {continueLabel}
      </Link>

      <aside className="synthese-refresh">
        <p>{synthesisRefreshData.synthesisButtonHint}</p>
        <Link to="/onboarding?mode=refresh" className="secondary-link">
          {synthesisRefreshData.synthesisButtonLabel}
        </Link>
      </aside>
    </section>
  )
}

export default Synthese
