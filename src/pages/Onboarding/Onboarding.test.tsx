import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Onboarding from './Onboarding'

const navigateMock = vi.fn()
const completeOnboardingMock = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('../../hooks/useCapClairState', () => ({
  useCapClairState: () => ({
    completeOnboarding: completeOnboardingMock,
  }),
}))

describe('Onboarding page', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    completeOnboardingMock.mockReset()
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
})
