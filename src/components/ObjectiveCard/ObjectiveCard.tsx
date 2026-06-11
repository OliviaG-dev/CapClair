import { Link } from 'react-router-dom'
import aiCoachData from '../../data/aiCoachData.json'
import ObjectiveFacts from '../ObjectiveFacts/ObjectiveFacts'
import type { Objective, ObjectiveStatus } from '../../types/capclair.types'
import './ObjectiveCard.css'

type ObjectiveCardProps = {
  objective: Objective
}

const statusLabels = aiCoachData.objectives.statusLabels as Record<ObjectiveStatus, string>

function ObjectiveCard({ objective }: ObjectiveCardProps) {
  return (
    <article className="objective-card">
      <div className="objective-card-top">
        <p className={`status status-${objective.status}`}>{statusLabels[objective.status]}</p>
        {objective.actionLabel ? (
          <span className="objective-card-action">{objective.actionLabel}</span>
        ) : null}
      </div>

      <p className="objective-card-focus">{objective.title}</p>

      {objective.description !== objective.title ? (
        <p className="objective-card-summary">{objective.description}</p>
      ) : null}

      {objective.nextSteps[0] ? (
        <p className="objective-card-next-step">{objective.nextSteps[0]}</p>
      ) : null}

      <div className="objective-meta">
        <ObjectiveFacts difficulty={objective.difficulty} deadline={objective.deadline} />
      </div>

      <Link to={`/objectifs/${objective.id}`} className="objective-link">
        Voir le détail
      </Link>
    </article>
  )
}

export default ObjectiveCard
