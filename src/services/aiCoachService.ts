import type { AppState, Objective, QuestionnaireAnswers, Synthesis } from '../types/capclair.types'
import aiCoachData from '../data/aiCoachData.json'

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
      aiCoachData.synthesis.extraTheme,
    ],
    suggestedGoals: [
      `${aiCoachData.synthesis.goalPrefixes[0]} ${buildGoalTitle(answers.changeWish, aiCoachData.synthesis.goalFallbacks[0])}`,
      `${aiCoachData.synthesis.goalPrefixes[1]} ${buildGoalTitle(answers.blockingFactor, aiCoachData.synthesis.goalFallbacks[1])}`,
      `${aiCoachData.synthesis.goalPrefixes[2]} ${buildGoalTitle(answers.energySource, aiCoachData.synthesis.goalFallbacks[2])}`,
    ],
    firstAction: aiCoachData.synthesis.firstAction,
  }
}

export function generateObjectives(synthesis: Synthesis): Objective[] {
  return synthesis.suggestedGoals.slice(0, 3).map((goal, index) => ({
    id: `obj-${index + 1}-${Date.now()}`,
    title: goal,
    description: `${aiCoachData.objectives.descriptionPrefix} ${goal}`,
    deepReason: synthesis.wantsToChange,
    obstacles: [synthesis.blockers],
    motivation: `${aiCoachData.objectives.motivationPrefix} ${synthesis.importantThemes[0]}`,
    nextSteps: [...aiCoachData.objectives.nextSteps],
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
    return aiCoachData.weeklyInsights.empty
  }

  if (doneCount > 0) {
    return `Tu as deja valide ${doneCount} ${aiCoachData.weeklyInsights.doneSuffix}`
  }

  if (inProgress > 1) {
    return aiCoachData.weeklyInsights.multiInProgress
  }

  return aiCoachData.weeklyInsights.default
}
