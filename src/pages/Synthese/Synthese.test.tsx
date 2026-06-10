import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Synthese from './Synthese'

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => ({
    state: {
      synthesis: {
        wantsToChange: 'Avancer',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: ['Clarifier ma direction'],
        firstAction: 'Bloquer 15 minutes',
      },
    },
  }),
}))

describe('Synthese page', () => {
  it('exposes refresh synthesis entry point', () => {
    render(
      <MemoryRouter>
        <Synthese />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Ma situation a changé' })).toHaveAttribute(
      'href',
      '/onboarding?mode=refresh',
    )
  })
})
