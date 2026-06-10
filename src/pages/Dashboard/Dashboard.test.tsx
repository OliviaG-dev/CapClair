import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from './Dashboard'
import type { AppState } from '../../types/capclair.types'

const mockState: AppState = {
  answers: null,
  synthesis: {
    wantsToChange: 'Avancer',
    blockers: 'Le flou',
    importantThemes: ['Travail'],
    suggestedGoals: ['Clarifier ma direction'],
    firstAction: 'Faire une action simple',
  },
  objectives: [
    {
      id: 'obj-1',
      title: 'Clarifier ma direction',
      description: 'Description A',
      deepReason: 'Raison A',
      obstacles: ['Obstacle A'],
      motivation: 'Motivation A',
      nextSteps: ['Step A'],
      status: 'in_progress',
      difficulty: 'medium',
      deadline: '2026-12-31',
      progressHistory: [],
    },
    {
      id: 'obj-2',
      title: 'Stabiliser ma routine',
      description: 'Description B',
      deepReason: 'Raison B',
      obstacles: ['Obstacle B'],
      motivation: 'Motivation B',
      nextSteps: ['Step B'],
      status: 'done',
      difficulty: 'easy',
      deadline: '2026-12-31',
      progressHistory: [],
    },
  ],
  journal: [
    {
      id: 'j-1',
      createdAt: '2026-01-01T10:00:00.000Z',
      mood: 4,
      energy: 3,
      note: 'Bonne journee',
    },
  ],
  handoffCompleted: true,
}

const mockContext = {
  state: mockState,
  weeklyInsight: 'Concentre-toi sur un seul objectif prioritaire.',
}

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => mockContext,
}))

describe('Dashboard page', () => {
  beforeEach(() => {
    mockContext.state = {
      ...mockState,
      synthesis: {
        wantsToChange: 'Avancer',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: ['Clarifier ma direction'],
        firstAction: 'Faire une action simple',
      },
    }
    mockContext.weeklyInsight = 'Concentre-toi sur un seul objectif prioritaire.'
  })

  it('renders daily action from in-progress objective next step', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: "Aujourd'hui" })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Action du jour' })).toBeInTheDocument()
    const dailyAction = screen.getByRole('article', { name: /action du jour/i })
    expect(within(dailyAction).getByText('Step A')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clarifier ma direction' })).toHaveAttribute(
      'href',
      '/objectifs/obj-1',
    )
    expect(screen.getByText('Objectifs en cours')).toBeInTheDocument()
    expect(screen.getByText('Objectifs terminés')).toBeInTheDocument()
    expect(screen.getByText('Progression globale')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()
    expect(screen.getByText('Concentre-toi sur un seul objectif prioritaire.')).toBeInTheDocument()
  })

  it('falls back to synthesis firstAction when no objective is in progress', () => {
    mockContext.state = {
      ...mockState,
      objectives: mockState.objectives.map((objective) => ({
        ...objective,
        status: objective.id === 'obj-1' ? 'todo' : objective.status,
      })),
    }

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )

    expect(screen.getByText('Faire une action simple')).toBeInTheDocument()
    expect(screen.getByText('Point de départ de ta synthèse')).toBeInTheDocument()
  })

  it('redirects to onboarding when synthesis is missing', () => {
    mockContext.state = {
      ...mockContext.state,
      synthesis: null,
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<p>Onboarding target</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Onboarding target')).toBeInTheDocument()
  })
})
