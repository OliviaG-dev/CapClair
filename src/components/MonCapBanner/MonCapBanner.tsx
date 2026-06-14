import { Link } from 'react-router-dom'
import handoffData from '../../data/handoffData.json'
import type { Objective } from '../../types/capclair.types'
import './MonCapBanner.css'

type MonCapBannerProps = {
  objectives: Objective[]
}

function MonCapBanner({ objectives }: MonCapBannerProps) {
  const activeObjective = objectives.find((objective) => objective.status === 'in_progress')

  return (
    <aside className="mon-cap-banner" aria-label={handoffData.monCapBannerLabel}>
      <div className="mon-cap-banner-inner">
        <p className="mon-cap-banner-label">
          <span className="mon-cap-banner-label-icon" aria-hidden="true">
            ◆
          </span>
          <span className="mon-cap-banner-label-text">{handoffData.monCapBannerLabel}</span>
        </p>

        {activeObjective ? (
          <div className="mon-cap-banner-focus-wrap">
            <span className="mon-cap-banner-focus-prefix">{handoffData.monCapFocusPrefix}</span>
            <Link to={`/objectifs/${activeObjective.id}`} className="mon-cap-banner-link">
              {activeObjective.title}
            </Link>
          </div>
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
