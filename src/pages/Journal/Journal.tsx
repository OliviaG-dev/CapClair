import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useCapClairState } from '../../hooks/useCapClairState'
import './Journal.css'

function Journal() {
  const { state, addJournalEntry } = useCapClairState()
  const [note, setNote] = useState('')
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)

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

      <article className="journal-form">
        <label htmlFor="journal-note">Note du jour</label>
        <textarea
          id="journal-note"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ecris une petite victoire, un ressenti ou un blocage."
        />

        <div className="range-grid">
          <label>
            Humeur: {mood}/5
            <input
              type="range"
              min={1}
              max={5}
              value={mood}
              onChange={(event) => setMood(Number(event.target.value))}
            />
          </label>
          <label>
            Energie: {energy}/5
            <input
              type="range"
              min={1}
              max={5}
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => {
            addJournalEntry({ note, mood, energy })
            setNote('')
            setMood(3)
            setEnergy(3)
          }}
        >
          Enregistrer
        </button>
      </article>

      <ul className="journal-list">
        {state.journal.map((entry) => (
          <li key={entry.id}>
            <strong>{new Date(entry.createdAt).toLocaleDateString()}</strong>
            <span>Humeur {entry.mood}/5 - Energie {entry.energy}/5</span>
            <p>{entry.note}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Journal
