import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Handoff from './Handoff'

const completeHandoffMock = vi.fn()

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => ({
    state: {
      handoffCompleted: false,
      synthesis: {
        wantsToChange: 'Avancer',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: ['Clarifier ma direction'],
        firstAction: 'Bloquer 15 minutes',
      },
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
        {
          id: 'obj-2',
          title: 'Stabiliser ma routine',
          description: 'Description B',
          deepReason: 'Raison B',
          obstacles: ['Obstacle B'],
          motivation: 'Motivation B',
          nextSteps: ['Step B'],
          status: 'todo',
          difficulty: 'easy',
          deadline: '2026-12-31',
          progressHistory: [],
        },
      ],
    },
    completeHandoff: completeHandoffMock,
  }),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Handoff page', () => {
  it('requires confirmation and objective selection before submit', async () => {
    const user = userEvent.setup()
    completeHandoffMock.mockReset()
    navigateMock.mockReset()

    render(
      <MemoryRouter>
        <Handoff />
      </MemoryRouter>,
    )

    const submitButton = screen.getByRole('button', { name: 'Commencer avec cet objectif' })
    expect(submitButton).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)

    expect(completeHandoffMock).toHaveBeenCalledWith('obj-1')
    expect(navigateMock).toHaveBeenCalledWith('/dashboard')
  })
})
