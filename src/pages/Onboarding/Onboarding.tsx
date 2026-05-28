import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import onboardingConfig from '../../data/onboardingConfig.json'
import suggestionsData from '../../data/onboardingSuggestions.json'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { QuestionnaireAnswers } from '../../types/capclair.types'
import './Onboarding.css'

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
  const navigate = useNavigate()
  const { completeOnboarding } = useCapClairState()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(emptyAnswers)
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

  const currentQuestion = questions[step]
  const currentCategory = selectedCategories[currentQuestion.key]
  const currentSuggestions = suggestionsByQuestion[currentQuestion.key][currentCategory]
  const isLastStep = step === questions.length - 1
  const canContinue = answers[currentQuestion.key].trim().length > 2
  const progress = useMemo(() => Math.round(((step + 1) / questions.length) * 100), [step])

  const getCurrentLines = () =>
    answers[currentQuestion.key]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

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

  const handleNext = () => {
    if (!canContinue) {
      return
    }

    if (isLastStep) {
      completeOnboarding(answers)
      navigate('/synthese')
      return
    }

    setStep((value) => value + 1)
  }

  return (
    <section className="onboarding">
      <p className="pill">Onboarding</p>
      <h1>Retrouve ton cap en répondant à quelques questions</h1>
      <p className="subtitle">Progression: {progress}%</p>
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
        <div className="question-actions">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            Précédent
          </button>
          <button type="button" onClick={handleNext} disabled={!canContinue}>
            {isLastStep ? 'Générer ma synthèse' : 'Suivant'}
          </button>
        </div>
      </article>
    </section>
  )
}

export default Onboarding
