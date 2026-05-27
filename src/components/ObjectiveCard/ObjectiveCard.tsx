import { Link } from 'react-router-dom'
import type { Objective } from '../../types/capclair.types'
import './ObjectiveCard.css'

type ObjectiveCardProps = {
  objective: Objective
}

function ObjectiveCard({ objective }: ObjectiveCardProps) {
  return (
    <article className="objective-card">
      <p className={`status status-${objective.status}`}>{objective.status}</p>
      <h3>{objective.title}</h3>
      <p>{objective.description}</p>
      <div className="objective-meta">
        <span>Difficulte: {objective.difficulty}</span>
        <span>Deadline: {objective.deadline}</span>
      </div>
      <Link to={`/objectifs/${objective.id}`} className="objective-link">
        Voir le detail
      </Link>
    </article>
  )
}

export default ObjectiveCard
