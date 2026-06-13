import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Journal.css'

const JOURNAL_LEVELS = [1, 2, 3, 4, 5] as const

type JournalLevelPickerProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

function JournalLevelPicker({ label, value, onChange }: JournalLevelPickerProps) {
  return (
    <div className="journal-form-metric">
      <div className="journal-form-metric-head">
        <span className="journal-form-metric-label">{label}</span>
        <span className="journal-stat" data-level={value}>
          {value}/5
        </span>
      </div>
      <div className="journal-level-picker" role="group" aria-label={label}>
        {JOURNAL_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            className={
              value === level ? 'journal-level-btn journal-level-btn-active' : 'journal-level-btn'
            }
            data-level={level}
            aria-pressed={value === level}
            onClick={() => onChange(level)}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}

function Journal() {
  const { state, addJournalEntry } = useCapClairState()
  const [note, setNote] = useState('')
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)

  const canSubmit = note.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    addJournalEntry({ note: note.trim(), mood, energy })
    setNote('')
    setMood(3)
    setEnergy(3)
  }

  if (!state.synthesis) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <section className="journal">
      <header className="page-hero">
        <p className="chip chip-accent">Ancrage quotidien</p>
        <h1>Journal de progression</h1>
        <p className="page-subtitle">
          Note ton état, observe ton énergie et renforce les micro-victoires qui t’aident à avancer.
        </p>
      </header>

      <article className="journal-form" aria-labelledby="journal-form-title">
        <header className="journal-form-header">
          <div className="journal-form-header-main">
            <span className="journal-form-header-icon" aria-hidden="true">
              ✎
            </span>
            <div className="journal-form-header-copy">
              <div className="journal-form-header-top">
                <span className="journal-form-header-badge">Check-in</span>
                <time
                  className="journal-form-header-date"
                  dateTime={new Date().toISOString().slice(0, 10)}
                >
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </time>
              </div>
              <h2 id="journal-form-title">Nouvelle entrée</h2>
              <p className="journal-form-header-hint">
                Quelques secondes pour capturer ton ressenti du moment.
              </p>
            </div>
          </div>
          <div className="journal-form-header-preview" aria-live="polite" aria-atomic="true">
            <span className="journal-stat journal-stat-mood" data-level={mood}>
              Humeur {mood}/5
            </span>
            <span className="journal-stat journal-stat-energy" data-level={energy}>
              Énergie {energy}/5
            </span>
          </div>
        </header>

        <div className="journal-form-field">
          <label htmlFor="journal-note">Note du jour</label>
          <textarea
            id="journal-note"
            className="journal-form-textarea"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Écris une petite victoire, un ressenti ou un blocage."
          />
        </div>

        <div className="journal-form-metrics">
          <JournalLevelPicker label="Humeur" value={mood} onChange={setMood} />
          <JournalLevelPicker label="Énergie" value={energy} onChange={setEnergy} />
        </div>

        <button
          type="button"
          className="journal-form-submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Enregistrer l&apos;entrée
        </button>
      </article>

      <ul className="journal-list">
        {state.journal.map((entry) => (
          <li key={entry.id}>
            <div className="journal-entry-meta">
              <time className="journal-entry-date" dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <time className="journal-entry-time" dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <span className="journal-list-stats">
              <span className="journal-stat journal-stat-mood" data-level={entry.mood}>
                Humeur {entry.mood}/5
              </span>
              <span className="journal-stat journal-stat-energy" data-level={entry.energy}>
                Énergie {entry.energy}/5
              </span>
            </span>
            <p className="journal-entry-note">{entry.note}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Journal
