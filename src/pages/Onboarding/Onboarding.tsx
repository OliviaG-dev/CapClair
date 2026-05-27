import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCapClairState } from '../../hooks/useCapClairState'
import type { QuestionnaireAnswers } from '../../types/capclair.types'
import './Onboarding.css'

const questions: Array<{ key: keyof QuestionnaireAnswers; label: string }> = [
  { key: 'changeWish', label: 'Qu est-ce que tu aimerais changer en ce moment ?' },
  { key: 'heaviestWeight', label: 'Qu est-ce qui te pese le plus ?' },
  { key: 'improvementFocus', label: 'Qu est-ce que tu veux ameliorer dans ta vie ?' },
  { key: 'blockingFactor', label: 'Qu est-ce qui t empeche d avancer ?' },
  { key: 'energySource', label: 'Qu est-ce qui te donne encore un peu d energie ?' },
  {
    key: 'progressVision',
    label: 'Dans 3 mois, qu est-ce qui te ferait dire "j ai avance" ?',
  },
]

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

  const currentQuestion = questions[step]
  const isLastStep = step === questions.length - 1
  const canContinue = answers[currentQuestion.key].trim().length > 2
  const progress = useMemo(() => Math.round(((step + 1) / questions.length) * 100), [step])

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
      <h1>Retrouve ton cap en repondant a quelques questions</h1>
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
          placeholder="Ecris librement, il n y a pas de bonne ou mauvaise reponse."
          rows={6}
        />
        <div className="question-actions">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            Precedent
          </button>
          <button type="button" onClick={handleNext} disabled={!canContinue}>
            {isLastStep ? 'Generer ma synthese' : 'Suivant'}
          </button>
        </div>
      </article>
    </section>
  )
}

export default Onboarding
