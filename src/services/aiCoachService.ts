import type {
  AppState,
  Objective,
  OnboardingGeneration,
  QuestionnaireAnswers,
  Synthesis,
} from '../types/capclair.types'
import aiCoachData from '../data/aiCoachData.json'
import { buildObjectiveSentenceDrafts } from '../utils/buildObjectiveSentenceDrafts'
import { mapObjectiveDraftsToObjectives } from '../utils/mapObjectiveDrafts'

const nextQuarterDeadline = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().slice(0, 10)
}

const actionLabels = aiCoachData.objectives.actionLabels as string[]
const maxObjectiveCount = aiCoachData.objectives.maxCount as number

const buildAnswerSources = (answers: QuestionnaireAnswers) => [
  { text: answers.changeWish, actionLabel: actionLabels[0] },
  { text: answers.blockingFactor, actionLabel: actionLabels[1] },
  { text: answers.improvementFocus, actionLabel: actionLabels[2] },
  { text: answers.energySource, actionLabel: actionLabels[3] },
]

const buildSynthesisSources = (synthesis: Synthesis) => [
  { text: synthesis.wantsToChange, actionLabel: actionLabels[0] },
  { text: synthesis.blockers, actionLabel: actionLabels[1] },
  { text: synthesis.importantThemes[0], actionLabel: actionLabels[2] },
  { text: synthesis.importantThemes[1], actionLabel: actionLabels[3] },
]

export function generateSynthesis(answers: QuestionnaireAnswers): Synthesis {
  const sentenceDrafts = buildObjectiveSentenceDrafts(buildAnswerSources(answers), maxObjectiveCount)

  return {
    wantsToChange: answers.changeWish,
    blockers: answers.blockingFactor,
    importantThemes: [
      answers.improvementFocus,
      answers.energySource,
      aiCoachData.synthesis.extraTheme,
    ],
    suggestedGoals: sentenceDrafts.map((draft) => draft.sentence),
    firstAction: aiCoachData.synthesis.firstAction,
  }
}

export function generateObjectives(synthesis: Synthesis): Objective[] {
  const sentenceDrafts = buildObjectiveSentenceDrafts(buildSynthesisSources(synthesis), maxObjectiveCount)
  const nextSteps = aiCoachData.objectives.nextSteps as string[]

  return sentenceDrafts.map((draft, index) => ({
    id: `obj-${index + 1}-${Date.now()}`,
    actionLabel: draft.actionLabel,
    title: draft.sentence,
    description: draft.sentence,
    deepReason: synthesis.wantsToChange,
    obstacles: [synthesis.blockers],
    motivation: `${aiCoachData.objectives.motivationPrefix} ${synthesis.importantThemes[0]}`,
    nextSteps: [nextSteps[index % nextSteps.length]],
    status: index === 0 ? 'in_progress' : 'todo',
    difficulty: index === 0 ? 'medium' : 'easy',
    deadline: nextQuarterDeadline(),
    progressHistory: [],
  }))
}

export function resolveOnboardingGeneration(
  answers: QuestionnaireAnswers,
  generationOverride?: OnboardingGeneration | null,
): { synthesis: Synthesis; objectives: Objective[] } {
  const synthesis = generationOverride?.synthesis ?? generateSynthesis(answers)
  const objectives =
    generationOverride?.objectives && generationOverride.objectives.length > 0
      ? mapObjectiveDraftsToObjectives(generationOverride.objectives)
      : generateObjectives(synthesis)

  return { synthesis, objectives }
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
