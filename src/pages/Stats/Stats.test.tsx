import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Stats from './Stats'
import type { AppState } from '../../types/capclair.types'
import statsPageData from '../../data/statsPageData.json'

const mockState: AppState = {
  answers: null,
  synthesis: {
    wantsToChange: 'Avancer',
    blockers: 'Le flou',
    importantThemes: ['Travail'],
    suggestedGoals: ['Clarifier'],
    firstAction: 'Une action',
  },
  objectives: [
    {
      id: 'obj-1',
      title: 'Clarifier',
      description: 'Desc',
      deepReason: 'Raison',
      obstacles: [],
      motivation: 'Motivation',
      nextSteps: ['Step'],
      completedSteps: [],
      status: 'done',
      difficulty: 'easy',
      deadline: '2026-12-31',
      progressHistory: [],
    },
    {
      id: 'obj-2',
      title: 'Routine',
      description: 'Desc',
      deepReason: 'Raison',
      obstacles: [],
      motivation: 'Motivation',
      nextSteps: ['Step'],
      completedSteps: [],
      status: 'in_progress',
      difficulty: 'medium',
      deadline: '2026-12-31',
      progressHistory: [],
    },
  ],
  journal: [
    {
      id: 'j-1',
      createdAt: '2026-06-01T10:00:00.000Z',
      mood: 4,
      energy: 3,
      note: 'Bonne journee',
    },
  ],
  handoffCompleted: true,
  synthesisSource: 'local',
  actionHistory: [
    {
      id: 'a-1',
      text: 'Action validee',
      completedAt: '2026-06-02T10:00:00.000Z',
      source: 'synthesis',
    },
  ],
  completedSynthesisFirstAction: false,
}

const mockContext = {
  state: mockState,
  weeklyInsight: 'Concentre-toi sur un seul objectif prioritaire.',
}

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => mockContext,
}))

describe('Stats page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    mockContext.state = {
      ...mockState,
      synthesis: {
        wantsToChange: 'Avancer',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: ['Clarifier'],
        firstAction: 'Une action',
      },
    }
  })

  it('renders interactive stats sections and period picker', async () => {
    const user = userEvent.setup()

    render(<Stats />)

    expect(screen.getByRole('heading', { name: 'Statistiques et progression' })).toBeInTheDocument()
    expect(screen.getByText('Concentre-toi sur un seul objectif prioritaire.')).toBeInTheDocument()
    expect(screen.getByText('Progression globale')).toBeInTheDocument()
    expect(screen.getByText('Répartition des objectifs')).toBeInTheDocument()
    expect(screen.getByText('Bien-être')).toBeInTheDocument()
    expect(screen.getByText('Rythme d\'activité')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '7 jours' }))
    expect(screen.getByRole('button', { name: '7 jours' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Énergie' }))
    expect(screen.getByRole('button', { name: 'Énergie' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('redirects to onboarding when synthesis is missing', () => {
    mockContext.state = {
      ...mockContext.state,
      synthesis: null,
    }

    render(
      <MemoryRouter initialEntries={['/stats']}>
        <Routes>
          <Route path="/stats" element={<Stats />} />
          <Route path="/onboarding" element={<p>Onboarding target</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Onboarding target')).toBeInTheDocument()
  })

  it('shows empty states when there is no journal or activity data', () => {
    mockContext.state = {
      ...mockContext.state,
      journal: [],
      actionHistory: [],
    }

    render(<Stats />)

    expect(screen.getByText(statsPageData.empty.journalTrend)).toBeInTheDocument()
    expect(screen.getByText(statsPageData.empty.activity)).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('updates journal kpi when period changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T12:00:00.000Z'))

    mockContext.state = {
      ...mockContext.state,
      journal: [
        {
          id: 'j-recent-1',
          createdAt: '2026-06-09T10:00:00.000Z',
          mood: 4,
          energy: 3,
          note: 'Recent 1',
        },
        {
          id: 'j-recent-2',
          createdAt: '2026-06-10T10:00:00.000Z',
          mood: 5,
          energy: 4,
          note: 'Recent 2',
        },
        {
          id: 'j-old',
          createdAt: '2026-05-01T10:00:00.000Z',
          mood: 2,
          energy: 2,
          note: 'Old',
        },
      ],
      actionHistory: [],
    }

    render(<Stats />)

    const journalCard = screen.getByText('Entrées journal').closest('.stats-kpi-card')
    expect(journalCard).not.toBeNull()
    expect(within(journalCard as HTMLElement).getByText('2')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tout' }))
    expect(within(journalCard as HTMLElement).getByText('3')).toBeInTheDocument()
  })
})
