import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import aiCoachData from '../../data/aiCoachData.json'
import objectifDetailData from '../../data/objectifDetailData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { ObjectiveDifficulty, ObjectiveStatus } from '../../types/capclair.types'
import { formatDeadline } from '../../utils/formatDeadline'
import './ObjectifDetail.css'

const statusLabels = aiCoachData.objectives.statusLabels as Record<ObjectiveStatus, string>
const difficultyLabels = objectifDetailData.difficultyLabels as Record<ObjectiveDifficulty, string>

function ObjectifDetail() {
  const { id } = useParams()
  const { state, updateObjective, addProgressNote } = useCapClairState()
  const [note, setNote] = useState('')

  const objective = useMemo(
    () => state.objectives.find((currentObjective) => currentObjective.id === id),
    [state.objectives, id],
  )

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  if (!objective) {
    return <Navigate to="/objectifs" replace />
  }

  const primaryStep = objective.nextSteps[0]
  const remainingSteps = objective.nextSteps.slice(1)

  const handleStatusChange = (status: ObjectiveStatus) => {
    updateObjective({
      ...objective,
      status,
    })
  }

  return (
    <section className="objectif-detail">
      <Link to="/objectifs" className="objectif-detail-back">
        {objectifDetailData.backLink}
      </Link>

      <header className="objectif-detail-hero">
        <div className="objectif-detail-meta">
          <p className={`objectif-detail-status status status-${objective.status}`}>
            {statusLabels[objective.status]}
          </p>
          {objective.actionLabel ? (
            <span className="objectif-detail-action">{objective.actionLabel}</span>
          ) : null}
          <span className="objectif-detail-pill">
            Difficulte: {difficultyLabels[objective.difficulty]}
          </span>
          <span className="objectif-detail-pill">
            Echeance: {formatDeadline(objective.deadline)}
          </span>
        </div>

        <h1>{objective.title}</h1>
        {objective.description !== objective.title ? (
          <p className="objectif-detail-summary">{objective.description}</p>
        ) : null}
      </header>

      {primaryStep ? (
        <article className="objectif-focus-card">
          <p className="objectif-focus-badge">{objectifDetailData.focusBadge}</p>
          <p className="objectif-focus-text">{primaryStep}</p>
        </article>
      ) : null}

      <div className="objectif-detail-grid">
        <article className="objectif-detail-card objectif-detail-card-why">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.deepReason.badge}
            </span>
            <h2>{objectifDetailData.sections.deepReason.title}</h2>
          </header>
          <p className="objectif-detail-card-text">{objective.deepReason}</p>
        </article>

        <article className="objectif-detail-card objectif-detail-card-blockers">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.obstacles.badge}
            </span>
            <h2>{objectifDetailData.sections.obstacles.title}</h2>
          </header>
          <ul className="objectif-detail-list">
            {objective.obstacles.map((obstacle) => (
              <li key={obstacle} className="objectif-detail-list-item">
                <span className="objectif-detail-list-marker" aria-hidden="true">
                  !
                </span>
                <span>{obstacle}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="objectif-detail-card objectif-detail-card-motivation">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.motivation.badge}
            </span>
            <h2>{objectifDetailData.sections.motivation.title}</h2>
          </header>
          <p className="objectif-detail-card-text">{objective.motivation}</p>
        </article>
      </div>

      {objective.nextSteps.length > 0 ? (
        <article className="objectif-steps-card">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.nextSteps.badge}
            </span>
            <h2>{objectifDetailData.sections.nextSteps.title}</h2>
          </header>
          <ol className="objectif-steps-list">
            {remainingSteps.length > 0
              ? remainingSteps.map((step, index) => (
                  <li key={step} className="objectif-steps-item">
                    <span className="objectif-steps-index" aria-hidden="true">
                      {index + 2}
                    </span>
                    <span className="objectif-steps-text">{step}</span>
                  </li>
                ))
              : objective.nextSteps.map((step, index) => (
                  <li key={step} className="objectif-steps-item">
                    <span className="objectif-steps-index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="objectif-steps-text">{step}</span>
                  </li>
                ))}
          </ol>
        </article>
      ) : null}

      <article className="objectif-progress-card">
        <h2>{objectifDetailData.progressTitle}</h2>

        <div className="objectif-status-buttons" role="group" aria-label="Statut de l'objectif">
          {objectifDetailData.statusButtons.map((statusButton) => (
            <button
              key={statusButton.status}
              type="button"
              className={
                objective.status === statusButton.status
                  ? 'objectif-status-btn objectif-status-btn-active'
                  : 'objectif-status-btn'
              }
              aria-pressed={objective.status === statusButton.status}
              onClick={() => handleStatusChange(statusButton.status as ObjectiveStatus)}
            >
              {statusButton.label}
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={objectifDetailData.notePlaceholder}
          rows={3}
        />
        <button
          type="button"
          className="objectif-add-note-btn"
          onClick={() => {
            addProgressNote(objective.id, note, 1)
            setNote('')
          }}
        >
          {objectifDetailData.addNoteButton}
        </button>

        {objective.progressHistory.length > 0 ? (
          <ul className="objectif-history-list">
            {objective.progressHistory.map((entry) => (
              <li key={entry.id} className="objectif-history-item">
                <strong>{new Date(entry.createdAt).toLocaleDateString()}</strong>
                <span>{entry.note}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="objectif-history-empty">Aucune note pour le moment.</p>
        )}
      </article>
    </section>
  )
}

export default ObjectifDetail
