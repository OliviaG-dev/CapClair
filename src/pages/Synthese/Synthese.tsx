import { Link, Navigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import SynthesisSourceBadge from '../../components/SynthesisSourceBadge/SynthesisSourceBadge'
import handoffData from '../../data/handoffData.json'
import synthesisRefreshData from '../../data/synthesisRefreshData.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import { paginateList, SYNTHESE_GOALS_PAGE_SIZE } from '../../utils/paginateList'
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

type SyntheseGoalsCardProps = {
  goals: string[]
}

type PaginationChevronProps = {
  direction: 'previous' | 'next'
}

function PaginationChevron({ direction }: PaginationChevronProps) {
  return (
    <svg
      className="synthese-goals-pagination-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d={direction === 'previous' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatGoalsPaginationStatus(current: number, total: number): string {
  return handoffData.goalsPaginationStatus
    .replace('{current}', String(current))
    .replace('{total}', String(total))
}

function SyntheseGoalsCard({ goals }: SyntheseGoalsCardProps) {
  const goalsKey = useMemo(() => goals.join('\u0000'), [goals])
  const [pageByGoals, setPageByGoals] = useState<Record<string, number>>({})
  const totalPages = Math.max(1, Math.ceil(goals.length / SYNTHESE_GOALS_PAGE_SIZE))
  const storedPage = pageByGoals[goalsKey] ?? 1
  const currentPage = Math.min(Math.max(1, storedPage), totalPages)
  const pagination = useMemo(
    () => paginateList(goals, currentPage, SYNTHESE_GOALS_PAGE_SIZE),
    [goals, currentPage],
  )

  const setPage = (updater: number | ((page: number) => number)) => {
    setPageByGoals((previous) => {
      const nextPage =
        typeof updater === 'function' ? updater(currentPage) : updater
      const safePage = Math.min(Math.max(1, nextPage), totalPages)

      return {
        ...previous,
        [goalsKey]: safePage,
      }
    })
  }

  const showPagination = pagination.totalPages > 1

  return (
    <article className="synthese-card synthese-card-goals">
      <header className="synthese-card-header">
        <span className="synthese-card-badge">Pistes</span>
        <h2>
          Tes premières <span className="synthese-card-title-keep">pistes d&apos;objectifs</span>
        </h2>
      </header>
      <div className="synthese-card-body synthese-card-body-goals">
        <ul className="synthese-list">
          {pagination.items.map((goal, index) => {
            const globalIndex = pagination.startIndex + index

            return (
              <li key={`${goal}-${globalIndex}`} className="synthese-list-item synthese-goal-item">
                <span className="synthese-list-index" aria-hidden="true">
                  {globalIndex + 1}
                </span>
                <div className="synthese-goal-copy">
                  <span className="synthese-list-text">{goal}</span>
                </div>
              </li>
            )
          })}
        </ul>

        {showPagination ? (
          <nav className="synthese-goals-pagination" aria-label="Pagination des pistes d'objectifs">
            <button
              type="button"
              className="synthese-goals-pagination-nav"
              disabled={!pagination.hasPrevious}
              aria-label={handoffData.goalsPaginationPreviousLabel}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <PaginationChevron direction="previous" />
            </button>

            <span
              className="synthese-goals-pagination-status"
              aria-label={formatGoalsPaginationStatus(
                pagination.currentPage,
                pagination.totalPages,
              )}
            >
              <span className="synthese-goals-pagination-current">{pagination.currentPage}</span>
              <span className="synthese-goals-pagination-separator" aria-hidden="true">
                /
              </span>
              <span className="synthese-goals-pagination-total">{pagination.totalPages}</span>
            </span>

            <button
              type="button"
              className="synthese-goals-pagination-nav"
              disabled={!pagination.hasNext}
              aria-label={handoffData.goalsPaginationNextLabel}
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
            >
              <PaginationChevron direction="next" />
            </button>
          </nav>
        ) : null}
      </div>
    </article>
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

        <SyntheseGoalsCard goals={state.synthesis.suggestedGoals} />
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
