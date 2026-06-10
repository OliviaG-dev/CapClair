import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import aiCoachData from '../../data/aiCoachData.json'
import objectifDetailData from '../../data/objectifDetailData.json'
import ObjectiveFacts from '../../components/ObjectiveFacts/ObjectiveFacts'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { ObjectiveStatus } from '../../types/capclair.types'
import { findCurrentStep } from '../../utils/advanceObjectiveStep'
import { formatActionDate } from '../../utils/formatActionDate'
import { splitTextIntoSentences } from '../../utils/splitTextIntoSentences'
import './ObjectifDetail.css'

const statusLabels = aiCoachData.objectives.statusLabels as Record<ObjectiveStatus, string>

type ObjectifDetailBulletTextProps = {
  text: string
  singleClassName: string
  listClassName?: string
}

function ObjectifDetailBulletText({
  text,
  singleClassName,
  listClassName = 'objectif-detail-card-text-list',
}: ObjectifDetailBulletTextProps) {
  const sentences = splitTextIntoSentences(text)

  if (sentences.length <= 1) {
    return <p className={singleClassName}>{text}</p>
  }

  return (
    <ul className={listClassName}>
      {sentences.map((sentence, index) => (
        <li key={`${sentence}-${index}`} className="objectif-detail-card-text-item">
          <span className="objectif-detail-card-text-bullet" aria-hidden="true" />
          <span className="objectif-detail-card-text-line">{sentence}</span>
        </li>
      ))}
    </ul>
  )
}

type ObjectifDetailCardTextProps = {
  text: string
}

function ObjectifDetailCardText({ text }: ObjectifDetailCardTextProps) {
  return (
    <ObjectifDetailBulletText text={text} singleClassName="objectif-detail-card-text" />
  )
}

type ObjectifDetailObstaclesTextProps = {
  obstacles: string[]
}

function ObjectifDetailObstaclesText({ obstacles }: ObjectifDetailObstaclesTextProps) {
  const sentences = obstacles.flatMap((obstacle) => splitTextIntoSentences(obstacle))

  if (sentences.length === 0) {
    return null
  }

  if (sentences.length === 1) {
    return <p className="objectif-detail-card-text">{sentences[0]}</p>
  }

  return (
    <ul className="objectif-detail-card-text-list">
      {sentences.map((sentence, index) => (
        <li key={`${sentence}-${index}`} className="objectif-detail-card-text-item">
          <span className="objectif-detail-card-text-bullet" aria-hidden="true" />
          <span className="objectif-detail-card-text-line">{sentence}</span>
        </li>
      ))}
    </ul>
  )
}

function ObjectifDetail() {
  const { id } = useParams()
  const { state, updateObjective, addProgressNote, completeObjectiveStep } = useCapClairState()
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

  const currentStep = findCurrentStep(objective.nextSteps)
  const upcomingSteps = objective.nextSteps.filter((step) => step.trim().length > 0).slice(1)

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
        </div>
        <ObjectiveFacts difficulty={objective.difficulty} deadline={objective.deadline} />

        <h1>{objective.title}</h1>
        {objective.description !== objective.title ? (
          <ObjectifDetailBulletText
            text={objective.description}
            singleClassName="objectif-detail-summary"
            listClassName="objectif-detail-summary-list"
          />
        ) : null}
      </header>

      {currentStep ? (
        <article className="objectif-focus-card">
          <p className="objectif-focus-badge">{objectifDetailData.currentStepBadge}</p>
          <ObjectifDetailBulletText
            text={currentStep}
            singleClassName="objectif-focus-text"
            listClassName="objectif-focus-text-list"
          />
          <label className="objectif-step-complete">
            <input
              type="checkbox"
              onChange={(event) => {
                if (event.target.checked) {
                  completeObjectiveStep(objective.id)
                }
              }}
            />
            <span>{objectifDetailData.stepCompleteLabel}</span>
          </label>
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
          <ObjectifDetailCardText text={objective.deepReason} />
        </article>

        <article className="objectif-detail-card objectif-detail-card-blockers">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.obstacles.badge}
            </span>
            <h2>{objectifDetailData.sections.obstacles.title}</h2>
          </header>
          <ObjectifDetailObstaclesText obstacles={objective.obstacles} />
        </article>

        <article className="objectif-detail-card objectif-detail-card-motivation">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.motivation.badge}
            </span>
            <h2>{objectifDetailData.sections.motivation.title}</h2>
          </header>
          <ObjectifDetailCardText text={objective.motivation} />
        </article>
      </div>

      {((objective.completedSteps ?? []).length > 0 || upcomingSteps.length > 0) ? (
        <article className="objectif-steps-card">
          <header className="objectif-detail-card-header">
            <span className="objectif-detail-card-badge">
              {objectifDetailData.sections.nextSteps.badge}
            </span>
            <h2>{objectifDetailData.sections.nextSteps.title}</h2>
          </header>

          {(objective.completedSteps ?? []).length > 0 ? (
            <section className="objectif-completed-steps">
              <h3>{objectifDetailData.completedStepsTitle}</h3>
              <ul className="objectif-completed-steps-list">
                {(objective.completedSteps ?? []).map((step) => (
                  <li key={step.id} className="objectif-completed-step-item">
                    <span className="objectif-completed-step-check" aria-hidden="true">
                      ✓
                    </span>
                    <div className="objectif-completed-step-copy">
                      <span>{step.text}</span>
                      <time dateTime={step.completedAt}>{formatActionDate(step.completedAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {upcomingSteps.length > 0 ? (
            <section className="objectif-upcoming-steps">
              <h3>{objectifDetailData.upcomingStepsTitle}</h3>
              <ol className="objectif-steps-list">
                {upcomingSteps.map((step, index) => (
                  <li key={`${step}-${index}`} className="objectif-steps-item">
                    <span className="objectif-steps-index" aria-hidden="true">
                      {(objective.completedSteps ?? []).length + index + 2}
                    </span>
                    <span className="objectif-steps-text">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
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
