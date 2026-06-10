import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ObjectifDetail from './ObjectifDetail'
import type { AppState } from '../../types/capclair.types'

const updateObjectiveMock = vi.fn()
const addProgressNoteMock = vi.fn()

const mockState: AppState = {
  answers: null,
  synthesis: {
    wantsToChange: 'Changer de cap',
    blockers: 'Le flou',
    importantThemes: ['Travail'],
    suggestedGoals: ['Clarifier ma direction'],
    firstAction: 'Faire une action simple',
  },
  objectives: [
    {
      id: 'obj-1',
      title: 'Clarifier ma direction',
      description: 'Description test',
      deepReason: 'Retrouver du sens',
      obstacles: ['Le flou'],
      motivation: 'Avancer pas a pas',
      nextSteps: ['Definir une priorite'],
      status: 'todo',
      difficulty: 'medium',
      deadline: '2026-12-31',
      progressHistory: [],
    },
  ],
  journal: [],
  handoffCompleted: false,
}

const mockContext = {
  state: mockState,
  updateObjective: updateObjectiveMock,
  addProgressNote: addProgressNoteMock,
}

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => mockContext,
}))

describe('ObjectifDetail page', () => {
  beforeEach(() => {
    updateObjectiveMock.mockReset()
    addProgressNoteMock.mockReset()
    mockContext.state = {
      ...mockState,
      synthesis: {
        wantsToChange: 'Changer de cap',
        blockers: 'Le flou',
        importantThemes: ['Travail'],
        suggestedGoals: ['Clarifier ma direction'],
        firstAction: 'Faire une action simple',
      },
      objectives: [...mockState.objectives],
    }
  })

  it('renders selected objective and quick actions', () => {
    render(
      <MemoryRouter initialEntries={['/objectifs/obj-1']}>
        <Routes>
          <Route path="/objectifs/:id" element={<ObjectifDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Clarifier ma direction' })).toBeInTheDocument()
    expect(screen.getByText('Description test')).toBeInTheDocument()
    expect(screen.getByText('Action prioritaire')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terminé' })).toBeInTheDocument()
  })

  it('updates status and adds progress note', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/objectifs/obj-1']}>
        <Routes>
          <Route path="/objectifs/:id" element={<ObjectifDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Terminé' }))
    expect(updateObjectiveMock).toHaveBeenCalledTimes(1)
    expect(updateObjectiveMock.mock.calls[0][0].status).toBe('done')

    const textarea = screen.getByPlaceholderText("Qu'est-ce qui a avancé aujourd'hui ?")
    await user.type(textarea, 'J ai avance sur ma priorite')
    await user.click(screen.getByRole('button', { name: 'Ajouter une note' }))

    expect(addProgressNoteMock).toHaveBeenCalledWith('obj-1', 'J ai avance sur ma priorite', 1)
    expect(textarea).toHaveValue('')
  })

  it('redirects to onboarding when synthesis is missing', () => {
    mockContext.state = {
      ...mockContext.state,
      synthesis: null,
    }

    render(
      <MemoryRouter initialEntries={['/objectifs/obj-1']}>
        <Routes>
          <Route path="/objectifs/:id" element={<ObjectifDetail />} />
          <Route path="/onboarding" element={<p>Onboarding target</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Onboarding target')).toBeInTheDocument()
  })

  it('redirects to objectifs when objective is not found', () => {
    mockContext.state = {
      ...mockContext.state,
      objectives: [],
    }

    render(
      <MemoryRouter initialEntries={['/objectifs/unknown-id']}>
        <Routes>
          <Route path="/objectifs/:id" element={<ObjectifDetail />} />
          <Route path="/objectifs" element={<p>Objectifs target</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Objectifs target')).toBeInTheDocument()
  })
})
