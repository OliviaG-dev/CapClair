import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Onboarding from './Onboarding'

const navigateMock = vi.fn()
const completeOnboardingMock = vi.fn()
const refreshSynthesisMock = vi.fn()

const mockState = {
  answers: {
    changeWish: 'Ancien cap',
    heaviestWeight: 'Ancien poids',
    improvementFocus: 'Organisation',
    blockingFactor: 'Ancien blocage',
    energySource: 'Petites actions',
    progressVision: 'Avancer concretement',
  },
  synthesis: {
    wantsToChange: 'Ancien cap',
    blockers: 'Ancien blocage',
    importantThemes: ['Organisation'],
    suggestedGoals: ['Clarifier'],
    firstAction: 'Action simple',
  },
  objectives: [],
  journal: [],
}

let searchParams = new URLSearchParams()

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [searchParams],
  Navigate: ({ to }: { to: string }) => <div>Redirect to {to}</div>,
}))

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => ({
    state: mockState,
    completeOnboarding: completeOnboardingMock,
    refreshSynthesis: refreshSynthesisMock,
  }),
}))

describe('Onboarding page', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    completeOnboardingMock.mockReset()
    refreshSynthesisMock.mockReset()
    searchParams = new URLSearchParams()
    mockState.synthesis = {
      wantsToChange: 'Ancien cap',
      blockers: 'Ancien blocage',
      importantThemes: ['Organisation'],
      suggestedGoals: ['Clarifier'],
      firstAction: 'Action simple',
    }
  })

  it('shows first question with accents and category chips', () => {
    render(<Onboarding />)

    expect(
      screen.getByRole('heading', { name: 'Retrouve ton cap en répondant à quelques questions' }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Qu’est-ce que tu aimerais changer en ce moment ?'),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Santé' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Travail' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Amour' })).toBeInTheDocument()
  })

  it('toggles suggested phrase in textarea and enables next button', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    const textarea = screen.getByLabelText('Qu’est-ce que tu aimerais changer en ce moment ?')
    const nextButton = screen.getByRole('button', { name: 'Suivant' })
    const travailCategoryButton = screen.getByRole('tab', { name: 'Travail' })

    expect(nextButton).toBeDisabled()

    await user.click(travailCategoryButton)
    const suggestion = screen.getByRole('button', {
      name: 'Je veux trouver un travail qui me correspond.',
    })

    await user.click(suggestion)
    expect(textarea).toHaveValue('Je veux trouver un travail qui me correspond.')
    expect(nextButton).toBeEnabled()

    await user.click(suggestion)
    expect(textarea).toHaveValue('')
    expect(nextButton).toBeDisabled()
  })

  it('shows refresh questionnaire copy in refresh mode', () => {
    searchParams = new URLSearchParams('mode=refresh')

    render(<Onboarding />)

    expect(
      screen.getByRole('heading', { name: 'Ta situation a evolue ? Reprenons le fil' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Tes objectifs seront regeneres/)).toBeInTheDocument()
    expect(screen.getByText('Question 1/3')).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'Qu’est-ce qui a changé dans ce que tu veux transformer en ce moment ?',
      ),
    ).toHaveValue('Ancien cap')
  })
})
