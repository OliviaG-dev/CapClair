import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import handoffData from '../../data/handoffData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Handoff.css'

function Handoff() {
  const navigate = useNavigate()
  const { state, completeHandoff } = useCapClairState()
  const [hasConfirmedAction, setHasConfirmedAction] = useState(false)
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('')

  const defaultObjectiveId = useMemo(
    () => state.objectives[0]?.id ?? '',
    [state.objectives],
  )

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  if (state.handoffCompleted) {
    return <Navigate to="/dashboard" replace />
  }

  if (state.objectives.length === 0) {
    return <Navigate to="/synthese" replace />
  }

  const activeSelection = selectedObjectiveId || defaultObjectiveId
  const canSubmit = hasConfirmedAction && activeSelection.length > 0

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    completeHandoff(activeSelection)
    navigate('/dashboard')
  }

  return (
    <section className="handoff">
      <header className="page-hero">
        <p className="chip chip-accent">{handoffData.chipLabel}</p>
        <h1>{handoffData.title}</h1>
        <p className="page-subtitle">{handoffData.subtitle}</p>
      </header>

      <article className="handoff-card">
        <h2>{handoffData.priorityTitle}</h2>
        <p className="handoff-hint">{handoffData.priorityHint}</p>
        <div className="handoff-objective-list" role="radiogroup" aria-label={handoffData.priorityTitle}>
          {state.objectives.map((objective) => (
            <label
              key={objective.id}
              className={
                activeSelection === objective.id
                  ? 'handoff-objective-option handoff-objective-option-selected'
                  : 'handoff-objective-option'
              }
            >
              <input
                type="radio"
                name="primary-objective"
                value={objective.id}
                checked={activeSelection === objective.id}
                onChange={() => setSelectedObjectiveId(objective.id)}
              />
              <span className="handoff-objective-copy">
                <strong>{objective.title}</strong>
                {objective.description !== objective.title ? (
                  <span>{objective.description}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </article>

      <article className="handoff-card">
        <h2>{handoffData.firstActionTitle}</h2>
        <p className="handoff-action-text">{state.synthesis.firstAction}</p>
        <label className="handoff-confirm">
          <input
            type="checkbox"
            checked={hasConfirmedAction}
            onChange={(event) => setHasConfirmedAction(event.target.checked)}
          />
          <span>{handoffData.firstActionConfirmLabel}</span>
        </label>
      </article>

      <button type="button" className="handoff-submit" disabled={!canSubmit} onClick={handleSubmit}>
        {handoffData.submitButton}
      </button>
    </section>
  )
}

export default Handoff
