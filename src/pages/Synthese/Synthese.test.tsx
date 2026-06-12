import { render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('link', { name: "C'est devenu cet objectif →" })).toHaveAttribute(
      'href',
      '/objectifs/obj-1',
    )
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
})
