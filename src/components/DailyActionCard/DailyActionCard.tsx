import { Link } from 'react-router-dom'
import dailyActionData from '../../data/dailyActionData.json'
import type { ActionCompletionLog } from '../../types/capclair.types'
import type { DailyAction } from '../../types/dailyAction.types'
import { groupEntriesByDate } from '../../utils/formatActionDate'
import './DailyActionCard.css'

type DailyActionCardProps = {
  dailyAction: DailyAction
  actionHistory: ActionCompletionLog[]
  onComplete: () => void
}

function DailyActionCard({ dailyAction, actionHistory, onComplete }: DailyActionCardProps) {
  const canComplete = dailyAction.source !== 'all_done'
  const groupedHistory = groupEntriesByDate(actionHistory)

  return (
    <article className="daily-action" aria-labelledby="daily-action-title">
      <p className="daily-action-badge">Aujourd&apos;hui</p>
      <h2 id="daily-action-title">Action du jour</h2>
      <p className="daily-action-text">{dailyAction.text}</p>

      {dailyAction.source === 'in_progress_step' && dailyAction.objectiveId ? (
        <p className="daily-action-source">
          {dailyActionData.sourceLabels.inProgressPrefix}{' '}
          <Link to={`/objectifs/${dailyAction.objectiveId}`}>{dailyAction.objectiveTitle}</Link>
        </p>
      ) : null}

      {dailyAction.source === 'synthesis' ? (
        <p className="daily-action-source">{dailyActionData.sourceLabels.synthesis}</p>
      ) : null}

      {canComplete ? (
        <label className="daily-action-complete">
          <input
            type="checkbox"
            onChange={(event) => {
              if (event.target.checked) {
                onComplete()
              }
            }}
          />
          <span>{dailyActionData.completeLabel}</span>
        </label>
      ) : null}

      <section className="daily-action-history" aria-label={dailyActionData.historyTitle}>
        <h3>{dailyActionData.historyTitle}</h3>
        {groupedHistory.length > 0 ? (
          <div className="daily-action-history-groups">
            {groupedHistory.map((group) => (
              <div key={group.dateLabel} className="daily-action-history-group">
                <p className="daily-action-history-date">{group.dateLabel}</p>
                <ul className="daily-action-history-list">
                  {group.entries.map((entry) => (
                    <li key={entry.id} className="daily-action-history-item">
                      {entry.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="daily-action-history-empty">{dailyActionData.historyEmpty}</p>
        )}
      </section>
    </article>
  )
}

export default DailyActionCard
