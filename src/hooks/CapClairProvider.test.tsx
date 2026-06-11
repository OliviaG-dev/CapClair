import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CapClairProvider } from './CapClairProvider'
import { useCapClairState } from './useCapClairState'

function ProviderHarness() {
  const { state, completeOnboarding, refreshSynthesis, addJournalEntry, completeHandoff, updateObjective, completeDailyAction } =
    useCapClairState()

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
      <button
        type="button"
        onClick={() => {
          const primaryId = state.objectives[0]?.id
          if (primaryId) {
            completeHandoff(primaryId)
          }
        }}
      >
        Complete handoff
      </button>
      <button
        type="button"
        onClick={() => {
          const secondaryObjective = state.objectives[1]
          if (secondaryObjective) {
            updateObjective({ ...secondaryObjective, status: 'in_progress' })
          }
        }}
      >
        Switch primary objective
      </button>
      <button type="button" onClick={() => completeDailyAction()}>
        Complete daily action
      </button>
      <p data-testid="objectives-count">{state.objectives.length}</p>
      <p data-testid="journal-count">{state.journal.length}</p>
      <p data-testid="handoff-completed">{String(state.handoffCompleted)}</p>
      <p data-testid="primary-status">
        {state.objectives.find((objective) => objective.status === 'in_progress')?.title ?? 'none'}
      </p>
      <p data-testid="action-history-count">{state.actionHistory.length}</p>
      <p data-testid="synthesis-source">{state.synthesisSource ?? 'none'}</p>
      <p data-testid="first-pending-step">
        {state.objectives[0]?.nextSteps.find((step) => step.trim().length > 0) ?? 'none'}
      </p>
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

    expect(screen.getByTestId('objectives-count')).toHaveTextContent('4')
    expect(screen.getByTestId('handoff-completed')).toHaveTextContent('false')
    expect(screen.getByTestId('synthesis-source')).toHaveTextContent('local')
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

    expect(screen.getByTestId('objectives-count')).toHaveTextContent('4')
    expect(screen.getByTestId('journal-count')).toHaveTextContent('1')

    const persistedState = localStorage.getItem('capclair-state-v1')
    expect(persistedState).not.toBeNull()
    expect(persistedState).toContain('Nouveau cap')
    expect(persistedState).toContain('Petite victoire du jour')
  })

  it('marks one objective in progress when handoff is completed', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))
    await user.click(screen.getByRole('button', { name: 'Complete handoff' }))

    expect(screen.getByTestId('handoff-completed')).toHaveTextContent('true')
    expect(screen.getByTestId('primary-status')).not.toHaveTextContent('none')
  })

  it('keeps a single in-progress objective when switching priority', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))
    await user.click(screen.getByRole('button', { name: 'Switch primary objective' }))

    const inProgressCount = screen.getByTestId('primary-status').textContent
    expect(inProgressCount).not.toBe('none')
    expect(
      JSON.parse(localStorage.getItem('capclair-state-v1') ?? '{}').objectives.filter(
        (objective: { status: string }) => objective.status === 'in_progress',
      ),
    ).toHaveLength(1)
  })

  it('advances the daily action and keeps action history on completion', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))
    await user.click(screen.getByRole('button', { name: 'Complete handoff' }))
    const firstPendingStep = screen.getByTestId('first-pending-step').textContent

    await user.click(screen.getByRole('button', { name: 'Complete daily action' }))

    expect(screen.getByTestId('action-history-count')).toHaveTextContent('1')
    expect(screen.getByTestId('first-pending-step').textContent).not.toBe(firstPendingStep)
  })

  it('preserves objective progress when refreshing synthesis', async () => {
    const user = userEvent.setup()

    render(
      <CapClairProvider>
        <ProviderHarness />
      </CapClairProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Complete onboarding' }))
    await user.click(screen.getByRole('button', { name: 'Complete handoff' }))
    await user.click(screen.getByRole('button', { name: 'Complete daily action' }))

    const persistedBeforeRefresh = JSON.parse(localStorage.getItem('capclair-state-v1') ?? '{}')
    const completedStepsBeforeRefresh =
      persistedBeforeRefresh.objectives[0]?.completedSteps?.length ?? 0

    await user.click(screen.getByRole('button', { name: 'Refresh synthesis' }))

    const persistedAfterRefresh = JSON.parse(localStorage.getItem('capclair-state-v1') ?? '{}')
    expect(persistedAfterRefresh.objectives[0]?.completedSteps?.length ?? 0).toBe(
      completedStepsBeforeRefresh,
    )
    expect(persistedAfterRefresh.actionHistory?.length ?? 0).toBeGreaterThan(0)
  })
})
