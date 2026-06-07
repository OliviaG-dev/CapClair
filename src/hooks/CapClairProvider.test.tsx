import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CapClairProvider } from './CapClairProvider'
import { useCapClairState } from './useCapClairState'

function ProviderHarness() {
  const { state, completeOnboarding, refreshSynthesis, addJournalEntry } = useCapClairState()

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          completeOnboarding({
            changeWish: 'Retrouver mon cap',
            heaviestWeight: 'Le flou',
            improvementFocus: 'Mon organisation',
            blockingFactor: 'Le manque de clarte',
            energySource: 'Les petites actions',
            progressVision: 'Avoir avance de facon concrete',
          })
        }
      >
        Complete onboarding
      </button>
      <button
        type="button"
        onClick={() =>
          refreshSynthesis({
            changeWish: 'Nouveau cap',
            heaviestWeight: 'Le flou',
            improvementFocus: 'Mon organisation',
            blockingFactor: 'Nouveau blocage',
            energySource: 'Les petites actions',
            progressVision: 'Avoir avance de facon concrete',
          })
        }
      >
        Refresh synthesis
      </button>
      <button
        type="button"
        onClick={() =>
          addJournalEntry({
            mood: 4,
            energy: 3,
            note: ' Petite victoire du jour ',
          })
        }
      >
        Add journal entry
      </button>
      <p data-testid="objectives-count">{state.objectives.length}</p>
      <p data-testid="journal-count">{state.journal.length}</p>
    </div>
  )
}

describe('CapClairProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('hydrates state updates and persists onboarding results', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    expect(screen.getByTestId('objectives-count')).toHaveTextContent('0')
    expect(screen.getByTestId('journal-count')).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))

    expect(screen.getByTestId('objectives-count')).toHaveTextContent('3')
    const persistedAfterOnboarding = localStorage.getItem('capclair-state-v1')
    expect(persistedAfterOnboarding).not.toBeNull()
    expect(persistedAfterOnboarding).toContain('Retrouver mon cap')
  })

  it('adds a trimmed journal entry in state and localStorage', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Add journal entry' }))

    expect(screen.getByTestId('journal-count')).toHaveTextContent('1')
    const persistedState = localStorage.getItem('capclair-state-v1')
    expect(persistedState).not.toBeNull()
    expect(persistedState).toContain('Petite victoire du jour')
  })

  it('keeps journal entries when refreshing synthesis', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))
    await user.click(screen.getByRole('button', { name: 'Add journal entry' }))
    await user.click(screen.getByRole('button', { name: 'Refresh synthesis' }))

    expect(screen.getByTestId('objectives-count')).toHaveTextContent('3')
    expect(screen.getByTestId('journal-count')).toHaveTextContent('1')

    const persistedState = localStorage.getItem('capclair-state-v1')
    expect(persistedState).not.toBeNull()
    expect(persistedState).toContain('Nouveau cap')
    expect(persistedState).toContain('Petite victoire du jour')
  })
})
