import synthesisSourceData from '../../data/synthesisSourceData.json'
import type { SynthesisSource } from '../../types/capclair.types'
import './SynthesisSourceBadge.css'

type SynthesisSourceBadgeProps = {
  source: SynthesisSource
}

function SynthesisSourceBadge({ source }: SynthesisSourceBadgeProps) {
  const isAiSource = source === 'ai'
  const label = isAiSource ? synthesisSourceData.aiLabel : synthesisSourceData.localLabel
  const description = isAiSource
    ? synthesisSourceData.aiDescription
    : synthesisSourceData.localDescription

  return (
    <div
      className={
        isAiSource
          ? 'synthesis-source-badge synthesis-source-badge-ai'
          : 'synthesis-source-badge synthesis-source-badge-local'
      }
      role="status"
      aria-label={`${label} — ${description}`}
    >
      <span className="synthesis-source-badge-label">{label}</span>
      <span className="synthesis-source-badge-description">{description}</span>
    </div>
  )
}

export default SynthesisSourceBadge
