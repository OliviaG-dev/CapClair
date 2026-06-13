import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Journal from './Journal'
import type { AppState } from '../../types/capclair.types'

const addJournalEntryMock = vi.fn()

const mockState: AppState = {
  answers: null,
  synthesis: {
    wantsToChange: 'Aller mieux',
    blockers: 'Le stress',
    importantThemes: ['Sante'],
    suggestedGoals: ['Retrouver du calme'],
    firstAction: 'Respirer 5 minutes',
  },
  objectives: [],
  journal: [
    {
      id: 'journal-1',
      createdAt: '2026-01-01T10:00:00.000Z',
      mood: 4,
      energy: 3,
      note: 'J ai avance un peu aujourd hui',
    },
  ],
  handoffCompleted: true,
  synthesisSource: 'local',
  actionHistory: [],
  completedSynthesisFirstAction: false,
}

const mockContext = {
  state: mockState,
  addJournalEntry: addJournalEntryMock,
}

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => mockContext,
}))

describe('Journal page', () => {
  beforeEach(() => {
    mockContext.state = {
      ...mockState,
      synthesis: {
        wantsToChange: 'Aller mieux',
        blockers: 'Le stress',
        importantThemes: ['Sante'],
        suggestedGoals: ['Retrouver du calme'],
        firstAction: 'Respirer 5 minutes',
      },
    }
  })

  it('renders journal list and submits a new entry', async () => {
    addJournalEntryMock.mockReset()
    const user = userEvent.setup()

    render(<Journal />)

    expect(screen.getByRole('heading', { name: 'Journal de progression' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nouvelle entrée' })).toBeInTheDocument()
    expect(screen.getByText('J ai avance un peu aujourd hui')).toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: "Enregistrer l'entrée" })
    expect(submitButton).toBeDisabled()

    const textarea = screen.getByLabelText('Note du jour')
    await user.clear(textarea)
    await user.type(textarea, 'Nouvelle note')
    expect(submitButton).toBeEnabled()
    await user.click(submitButton)

    expect(addJournalEntryMock).toHaveBeenCalledWith({
      note: 'Nouvelle note',
      mood: 3,
      energy: 3,
    })
    expect(textarea).toHaveValue('')
  })

  it('keeps submit disabled for whitespace-only notes', async () => {
    addJournalEntryMock.mockReset()
    const user = userEvent.setup()

    render(<Journal />)

    const submitButton = screen.getByRole('button', { name: "Enregistrer l'entrée" })
    const textarea = screen.getByLabelText('Note du jour')

    await user.type(textarea, '   ')
    expect(submitButton).toBeDisabled()

    await user.click(submitButton)
    expect(addJournalEntryMock).not.toHaveBeenCalled()
  })

  it('submits selected mood and energy and resets the form', async () => {
    addJournalEntryMock.mockReset()
    const user = userEvent.setup()

    render(<Journal />)

    await user.type(screen.getByLabelText('Note du jour'), 'Check-in du soir')

    const moodPicker = screen.getByRole('group', { name: 'Humeur' })
    const energyPicker = screen.getByRole('group', { name: 'Énergie' })
    await user.click(within(moodPicker).getByRole('button', { name: '5' }))
    await user.click(within(energyPicker).getByRole('button', { name: '2' }))

    expect(screen.getByText('Humeur 5/5')).toBeInTheDocument()
    expect(screen.getByText('Énergie 2/5')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: "Enregistrer l'entrée" }))

    expect(addJournalEntryMock).toHaveBeenCalledWith({
      note: 'Check-in du soir',
      mood: 5,
      energy: 2,
    })
    expect(screen.getByLabelText('Note du jour')).toHaveValue('')
    expect(within(moodPicker).getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(energyPicker).getByRole('button', { name: '3' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('redirects to onboarding when synthesis is missing', () => {
    mockContext.state = {
      ...mockContext.state,
      synthesis: null,
    }

    render(
      <MemoryRouter initialEntries={['/journal']}>
        <Routes>
          <Route path="/journal" element={<Journal />} />
          <Route path="/onboarding" element={<p>Onboarding target</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Onboarding target')).toBeInTheDocument()
  })
})
