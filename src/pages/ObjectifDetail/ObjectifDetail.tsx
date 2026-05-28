import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import objectifDetailData from '../../data/objectifDetailData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { ObjectiveStatus } from '../../types/capclair.types'
import './ObjectifDetail.css'

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

  const handleStatusChange = (status: ObjectiveStatus) => {
    updateObjective({
      ...objective,
      status,
    })
  }

  return (
    <section className="objectif-detail">
      <Link to="/objectifs">Retour a mes objectifs</Link>
      <h1>{objective.title}</h1>
      <p>{objective.description}</p>

      <div className="detail-grid">
        <article>
          <h2>Raison profonde</h2>
          <p>{objective.deepReason}</p>
        </article>
        <article>
          <h2>Obstacle principal</h2>
          <ul>
            {objective.obstacles.map((obstacle) => (
              <li key={obstacle}>{obstacle}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Motivation</h2>
          <p>{objective.motivation}</p>
        </article>
        <article>
          <h2>Prochaines etapes</h2>
          <ol>
            {objective.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>

      <article className="quick-actions">
        <h2>Aide IA rapide</h2>
        <div>
          {objectifDetailData.quickActions.map((action) => (
            <button key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </article>

      <article className="progress-card">
        <h2>Historique des progres</h2>
        <div className="status-buttons">
          {objectifDetailData.statusButtons.map((statusButton) => (
            <button
              key={statusButton.status}
              type="button"
              onClick={() => handleStatusChange(statusButton.status as ObjectiveStatus)}
            >
              {statusButton.label}
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Qu est-ce qui a avance aujourd hui ?"
          rows={3}
        />
        <button
          type="button"
          onClick={() => {
            addProgressNote(objective.id, note, 1)
            setNote('')
          }}
        >
          Ajouter une note
        </button>

        <ul className="history-list">
          {objective.progressHistory.map((entry) => (
            <li key={entry.id}>
              <strong>{new Date(entry.createdAt).toLocaleDateString()}</strong> - {entry.note}
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

export default ObjectifDetail
