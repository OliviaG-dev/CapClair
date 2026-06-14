import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Synthese from './Synthese'
import type { AppState } from '../../types/capclair.types'

const mockState: AppState = {
  answers: null,
  handoffCompleted: false,
  synthesisSource: 'ai',
  actionHistory: [],
  completedSynthesisFirstAction: false,
  objectives: [
    {
      id: 'obj-1',
      title: 'Clarifier ma direction',
      description: 'Description',
      deepReason: 'Raison',
      obstacles: ['Obstacle'],
      motivation: 'Motivation',
      nextSteps: ['Step'],
      completedSteps: [],
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
  journal: [],
}

const mockContext = {
  state: mockState,
}

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => mockContext,
}))

describe('Synthese page', () => {
  beforeEach(() => {
    mockContext.state = {
      ...mockState,
      synthesisSource: 'ai',
    }
  })

  it('exposes refresh synthesis entry point and AI badge', () => {
    render(
      <MemoryRouter>
        <Synthese />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Mettre à jour ma synthèse' })).toHaveAttribute(
      'href',
      '/onboarding?mode=refresh',
    )
    expect(screen.getByText('Ma situation a changé')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: "C'est devenu cet objectif →" })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Changer mon cap' })).toHaveAttribute(
      'href',
      '/handoff',
    )
    expect(screen.getByText('Synthèse IA')).toBeInTheDocument()
  })

  it('hides handoff CTA when handoff is already completed', () => {
    mockContext.state = {
      ...mockContext.state,
      handoffCompleted: true,
    }

    render(
      <MemoryRouter>
        <Synthese />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Changer mon cap' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mettre à jour ma synthèse' })).toBeInTheDocument()
  })

  it('shows local mode badge when synthesis used fallback', () => {
    mockContext.state = {
      ...mockContext.state,
      synthesisSource: 'local',
    }

    render(
      <MemoryRouter>
        <Synthese />
      </MemoryRouter>,
    )

    expect(screen.getByText('Mode local')).toBeInTheDocument()
  })

  it('paginates suggested goals to three items per page', async () => {
    const user = userEvent.setup()

    mockContext.state = {
      ...mockContext.state,
      synthesis: {
        wantsToChange: 'Avancer',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: [
          'Objectif un',
          'Objectif deux',
          'Objectif trois',
          'Objectif quatre',
          'Objectif cinq',
        ],
        firstAction: 'Bloquer 15 minutes',
      },
    }

    render(
      <MemoryRouter>
        <Synthese />
      </MemoryRouter>,
    )

    expect(screen.getByText('Objectif un')).toBeInTheDocument()
    expect(screen.getByText('Objectif trois')).toBeInTheDocument()
    expect(screen.queryByText('Objectif quatre')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Page 1 sur 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page suivante' }))

    expect(screen.queryByText('Objectif un')).not.toBeInTheDocument()
    expect(screen.getByText('Objectif quatre')).toBeInTheDocument()
    expect(screen.getByText('Objectif cinq')).toBeInTheDocument()
    expect(screen.getByLabelText('Page 2 sur 2')).toBeInTheDocument()
  })
})
