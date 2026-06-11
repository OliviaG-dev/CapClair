import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SynthesisSourceBadge from './SynthesisSourceBadge'

describe('SynthesisSourceBadge', () => {
  it('renders AI synthesis label and description', () => {
    render(<SynthesisSourceBadge source="ai" />)

    expect(screen.getByText('Synthèse IA')).toBeInTheDocument()
    expect(screen.getByText(/OpenAI/)).toBeInTheDocument()
  })

  it('renders local fallback label and description', () => {
    render(<SynthesisSourceBadge source="local" />)

    expect(screen.getByText('Mode local')).toBeInTheDocument()
    expect(screen.getByText(/API n'était pas disponible/)).toBeInTheDocument()
  })
})
