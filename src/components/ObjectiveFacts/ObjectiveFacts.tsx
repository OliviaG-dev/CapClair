import objectifDetailData from '../../data/objectifDetailData.json'
import type { ObjectiveDifficulty } from '../../types/capclair.types'
import { formatDeadline } from '../../utils/formatDeadline'
import './ObjectiveFacts.css'

const intensityLabels = objectifDetailData.intensityLabels as Record<ObjectiveDifficulty, string>

type ObjectiveFactsProps = {
  difficulty: ObjectiveDifficulty
  deadline: string
}

function ObjectiveFacts({ difficulty, deadline }: ObjectiveFactsProps) {
  return (
    <div className="objective-facts">
      <div className="objective-fact objective-fact-intensity">
        <span className="objective-fact-label">{objectifDetailData.intensityLabel}</span>
        <span className={`objective-fact-intensity-value objective-fact-intensity-value-${difficulty}`}>
          {intensityLabels[difficulty]}
        </span>
      </div>

      <div className="objective-fact objective-fact-deadline">
        <span className="objective-fact-label">{objectifDetailData.deadlineLabel}</span>
        <time className="objective-fact-value" dateTime={deadline}>
          {formatDeadline(deadline)}
        </time>
      </div>
    </div>
  )
}

export default ObjectiveFacts
