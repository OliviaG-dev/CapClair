import { Link } from 'react-router-dom'
import handoffData from '../../data/handoffData.json'
import type { Objective, Synthesis } from '../../types/capclair.types'
import { splitTextIntoSentences } from '../../utils/splitTextIntoSentences'
import './MonCapBanner.css'

type MonCapBannerProps = {
  synthesis: Synthesis
  objectives: Objective[]
}

function MonCapBanner({ synthesis, objectives }: MonCapBannerProps) {
  const summarySentence = splitTextIntoSentences(synthesis.wantsToChange)[0] ?? synthesis.wantsToChange
  const activeObjective = objectives.find((objective) => objective.status === 'in_progress')

  return (
    <aside className="mon-cap-banner" aria-label={handoffData.monCapBannerLabel}>
      <div className="mon-cap-banner-inner">
        <p className="mon-cap-banner-label">{handoffData.monCapBannerLabel}</p>
        <p className="mon-cap-banner-summary">{summarySentence}</p>
        {activeObjective ? (
          <p className="mon-cap-banner-focus">
            {handoffData.monCapFocusPrefix}{' '}
            <Link to={`/objectifs/${activeObjective.id}`} className="mon-cap-banner-link">
              {activeObjective.title}
            </Link>
          </p>
        ) : (
          <p className="mon-cap-banner-focus mon-cap-banner-focus-muted">
            {handoffData.monCapNoFocus}
          </p>
        )}
      </div>
    </aside>
  )
}

export default MonCapBanner
