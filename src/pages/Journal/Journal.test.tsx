import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('J ai avance un peu aujourd hui')).toBeInTheDocument()

    const textarea = screen.getByLabelText('Note du jour')
    await user.clear(textarea)
    await user.type(textarea, 'Nouvelle note')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(addJournalEntryMock).toHaveBeenCalledWith({
      note: 'Nouvelle note',
      mood: 3,
      energy: 3,
    })
    expect(textarea).toHaveValue('')
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
