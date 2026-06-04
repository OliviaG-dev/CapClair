import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import onboardingConfig from '../../data/onboardingConfig.json'
import suggestionsData from '../../data/onboardingSuggestions.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import { generateOnboardingFromApi } from '../../services/aiApiService'
import type { QuestionnaireAnswers } from '../../types/capclair.types'
import './Onboarding.css'

type TurnstileRenderOptions = {
  sitekey: string
  action?: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

type TurnstileApi = {
  render: (element: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const questions = onboardingConfig.questions as Array<{
  key: keyof QuestionnaireAnswers
  label: string
}>

type SuggestionCategory = 'sante' | 'travail' | 'amour'

const categories = onboardingConfig.categories as Array<{ key: SuggestionCategory; label: string }>

const suggestionsByQuestion = suggestionsData as Record<
  keyof QuestionnaireAnswers,
  Record<SuggestionCategory, string[]>
>

const emptyAnswers: QuestionnaireAnswers = {
  changeWish: '',
  heaviestWeight: '',
  improvementFocus: '',
  blockingFactor: '',
  energySource: '',
  progressVision: '',
}

function Onboarding() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()
  const turnstileEnabled = Boolean(turnstileSiteKey)
  const navigate = useNavigate()
  const { completeOnboarding } = useCapClairState()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(emptyAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<
    Record<keyof QuestionnaireAnswers, SuggestionCategory>
  >({
    changeWish: 'sante',
    heaviestWeight: 'sante',
    improvementFocus: 'sante',
    blockingFactor: 'sante',
    energySource: 'sante',
    progressVision: 'sante',
  })
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  const currentQuestion = questions[step]
  const currentCategory = selectedCategories[currentQuestion.key]
  const currentSuggestions = suggestionsByQuestion[currentQuestion.key][currentCategory]
  const isLastStep = step === questions.length - 1
  const canContinue = answers[currentQuestion.key].trim().length > 2
  const progress = useMemo(() => Math.round(((step + 1) / questions.length) * 100), [step])

  useEffect(() => {
    if (
      !turnstileEnabled ||
      !isLastStep ||
      !turnstileContainerRef.current ||
      turnstileWidgetIdRef.current
    ) {
      return
    }

    const renderTurnstile = () => {
      if (!window.turnstile || !turnstileContainerRef.current || !turnstileSiteKey) {
        return
      }

      try {
        turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          action: 'onboarding_synthesize',
          callback: (token) => {
            setTurnstileToken(token)
            setTurnstileError('')
          },
          'expired-callback': () => {
            setTurnstileToken('')
            setTurnstileError('Le challenge a expiré, merci de valider à nouveau.')
          },
          'error-callback': () => {
            setTurnstileToken('')
            setTurnstileError('Validation anti-bot indisponible, réessaie dans un instant.')
          },
        })
      } catch {
        setTurnstileError(
          'Impossible de charger Turnstile. Vérifie ton bloqueur de pub et le domaine autorisé.',
        )
      }
    }

    if (window.turnstile) {
      renderTurnstile()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    )

    if (existingScript) {
      existingScript.addEventListener('load', renderTurnstile, { once: true })
      return () => {
        existingScript.removeEventListener('load', renderTurnstile)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderTurnstile, { once: true })
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', renderTurnstile)
    }
  }, [isLastStep, turnstileEnabled, turnstileSiteKey])

  const getCurrentLines = () =>
    answers[currentQuestion.key]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  const selectedSuggestionsCount = getCurrentLines().length

  const isSuggestionSelected = (suggestion: string) => getCurrentLines().includes(suggestion)

  const toggleSuggestion = (suggestion: string) => {
    const lines = getCurrentLines()
    const updatedLines = lines.includes(suggestion)
      ? lines.filter((line) => line !== suggestion)
      : [...lines, suggestion]

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.key]: updatedLines.join('\n'),
    }))
  }

  const handleNext = async () => {
    if (isSubmitting) {
      return
    }

    if (!canContinue) {
      return
    }

    if (isLastStep) {
      if (turnstileEnabled && !turnstileToken) {
        setTurnstileError('Merci de valider le challenge anti-bot avant de continuer.')
        return
      }

      let hasNavigated = false
      setTurnstileError('')
      setIsSubmitting(true)

      try {
        const generation = await generateOnboardingFromApi(answers, turnstileToken)
        completeOnboarding(answers, generation ?? undefined)
        navigate('/synthese')
        hasNavigated = true
      } catch {
        setTurnstileError('Une erreur est survenue. Réessaie dans un instant.')
      } finally {
        if (!hasNavigated) {
          setIsSubmitting(false)
        }
      }
      return
    }

    setStep((value) => value + 1)
  }

  return (
    <section className="onboarding">
      <p className="pill">Onboarding</p>
      <h1>Retrouve ton cap en répondant à quelques questions</h1>
      <p className="subtitle">
        Progression: {progress}% — plus tu décris ton vécu, plus la synthèse sera pertinente.
      </p>
      <div className="progress-bar">
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className="question-card">
        <p className="step-count">
          Question {step + 1}/{questions.length}
        </p>
        <label htmlFor={currentQuestion.key}>{currentQuestion.label}</label>
        <textarea
          id={currentQuestion.key}
          value={answers[currentQuestion.key]}
          onChange={(event) =>
            setAnswers((previous) => ({
              ...previous,
              [currentQuestion.key]: event.target.value,
            }))
          }
          placeholder="Écris librement, il n’y a pas de bonne ou mauvaise réponse."
          rows={6}
        />
        <div className="suggestions-block">
          <p>Tu peux sélectionner une catégorie puis une ou plusieurs mini-réponses :</p>
          <p className="selected-count">{selectedSuggestionsCount} idée(s) sélectionnée(s)</p>
          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                className={
                  currentCategory === category.key
                    ? 'category-tab category-tab-selected'
                    : 'category-tab'
                }
                onClick={() =>
                  setSelectedCategories((previous) => ({
                    ...previous,
                    [currentQuestion.key]: category.key,
                  }))
                }
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="suggestions-list">
            {currentSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={
                  isSuggestionSelected(suggestion)
                    ? 'suggestion-chip suggestion-chip-selected'
                    : 'suggestion-chip'
                }
                onClick={() => toggleSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        {isLastStep ? (
          <div className="final-step-row">
            {turnstileEnabled && (
              <div className="turnstile-block">
                <p className="turnstile-label">Vérification anti-bot</p>
                <div ref={turnstileContainerRef} className="turnstile-widget" />
              </div>
            )}
            <div className="question-actions final-step-buttons">
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0 || isSubmitting}
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue || isSubmitting}
              >
                {isSubmitting ? 'Génération...' : 'Générer ma synthèse'}
              </button>
            </div>
          </div>
        ) : (
          <div className="question-actions">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0 || isSubmitting}
            >
              Précédent
            </button>
            <button type="button" onClick={handleNext} disabled={!canContinue || isSubmitting}>
              Suivant
            </button>
          </div>
        )}
        {isLastStep && turnstileError && <p className="turnstile-error">{turnstileError}</p>}
      </article>
    </section>
  )
}

export default Onboarding
