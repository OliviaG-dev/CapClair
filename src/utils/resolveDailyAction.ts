import dailyActionData from '../data/dailyActionData.json'
import type { AppState } from '../types/capclair.types'
import type { DailyAction } from '../types/dailyAction.types'

const findFirstNonEmptyStep = (nextSteps: string[]) =>
  nextSteps.map((step) => step.trim()).find((step) => step.length > 0)

export function resolveDailyAction(state: AppState): DailyAction | null {
  if (!state.synthesis) {
    return null
  }

  const inProgressObjective = state.objectives.find(
    (objective) => objective.status === 'in_progress',
  )

  if (inProgressObjective) {
    const nextStep = findFirstNonEmptyStep(inProgressObjective.nextSteps)

    if (nextStep) {
      return {
        text: nextStep,
        source: 'in_progress_step',
        objectiveId: inProgressObjective.id,
        objectiveTitle: inProgressObjective.title,
      }
    }
  }

  const allObjectivesDone =
    state.objectives.length > 0 &&
    state.objectives.every((objective) => objective.status === 'done')

  if (allObjectivesDone) {
    return {
      text: dailyActionData.allDoneMessage,
      source: 'all_done',
    }
  }

  const firstAction = state.synthesis.firstAction.trim()

  if (firstAction.length > 0) {
    return {
      text: firstAction,
      source: 'synthesis',
    }
  }

  return null
}
