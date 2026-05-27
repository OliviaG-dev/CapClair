import type { AppState, Objective, QuestionnaireAnswers, Synthesis } from '../types/capclair.types'

const nextQuarterDeadline = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().slice(0, 10)
}

const buildGoalTitle = (base: string, fallback: string) =>
  `${base.trim().slice(0, 42) || fallback}`.replace(/\.$/, '')

export function generateSynthesis(answers: QuestionnaireAnswers): Synthesis {
  return {
    wantsToChange: answers.changeWish,
    blockers: answers.blockingFactor,
    importantThemes: [
      answers.improvementFocus,
      answers.energySource,
      'Besoin de clarté progressive',
    ],
    suggestedGoals: [
      `Clarifier ${buildGoalTitle(answers.changeWish, 'ma priorite')}`,
      `Agir sur ${buildGoalTitle(answers.blockingFactor, 'mon obstacle principal')}`,
      `Renforcer ${buildGoalTitle(answers.energySource, 'ma source d energie')}`,
    ],
    firstAction: 'Bloquer 15 minutes aujourd hui pour definir une seule action simple',
  }
}

export function generateObjectives(synthesis: Synthesis): Objective[] {
  return synthesis.suggestedGoals.slice(0, 3).map((goal, index) => ({
    id: `obj-${index + 1}-${Date.now()}`,
    title: goal,
    description: `Objectif prioritaire pour avancer sans surcharge mentale: ${goal}`,
    deepReason: synthesis.wantsToChange,
    obstacles: [synthesis.blockers],
    motivation: `Je veux avancer vers: ${synthesis.importantThemes[0]}`,
    nextSteps: [
      'Definir la version la plus simple de cet objectif',
      'Planifier la prochaine action de moins de 20 minutes',
      'Faire un point rapide en fin de semaine',
    ],
    status: index === 0 ? 'in_progress' : 'todo',
    difficulty: index === 0 ? 'medium' : 'easy',
    deadline: nextQuarterDeadline(),
    progressHistory: [],
  }))
}

export function buildWeeklyInsight(state: AppState): string {
  const doneCount = state.objectives.filter((objective) => objective.status === 'done').length
  const inProgress = state.objectives.filter(
    (objective) => objective.status === 'in_progress',
  ).length

  if (state.objectives.length === 0) {
    return 'Commence par une action tres simple pour transformer ton flou en elan concret.'
  }

  if (doneCount > 0) {
    return `Tu as deja valide ${doneCount} objectif(s). Continue avec des actions petites et concretes.`
  }

  if (inProgress > 1) {
    return 'Tu avances sur plusieurs fronts. Cette semaine, concentre-toi sur un seul objectif prioritaire.'
  }

  return 'Ton principal levier est la regularite. Garde une action quotidienne courte et realiste.'
}
