import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Synthese from './Synthese'

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => ({
    state: {
      handoffCompleted: false,
      objectives: [
        {
          id: 'obj-1',
          title: 'Clarifier ma direction',
          description: 'Description',
          deepReason: 'Raison',
          obstacles: ['Obstacle'],
          motivation: 'Motivation',
          nextSteps: ['Step'],
          status: 'todo',
          difficulty: 'medium',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
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
    expect(screen.getByRole('link', { name: "C'est devenu cet objectif →" })).toHaveAttribute(
      'href',
      '/objectifs/obj-1',
    )
    expect(screen.getByRole('link', { name: 'Continuer — choisir mon cap' })).toHaveAttribute(
      'href',
      '/handoff',
    )
  })
})
