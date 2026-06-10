import type { ActionCompletionLog, AppState } from '../types/capclair.types'
import { advanceObjectiveStep } from './advanceObjectiveStep'
import { resolveDailyAction } from './resolveDailyAction'

function createActionLog(
  text: string,
  source: ActionCompletionLog['source'],
  objectiveId?: string,
): ActionCompletionLog {
  return {
    id: crypto.randomUUID(),
    text,
    completedAt: new Date().toISOString(),
    objectiveId,
    source,
  }
}

export function applyDailyActionCompletion(state: AppState): AppState {
  const dailyAction = resolveDailyAction(state)

  if (!dailyAction || dailyAction.source === 'all_done') {
    return state
  }

  const actionLog = createActionLog(
    dailyAction.text,
    dailyAction.source === 'synthesis' ? 'synthesis' : 'in_progress_step',
    dailyAction.objectiveId,
  )

  if (dailyAction.source === 'in_progress_step' && dailyAction.objectiveId) {
    return {
      ...state,
      actionHistory: [actionLog, ...state.actionHistory],
      objectives: state.objectives.map((objective) =>
        objective.id === dailyAction.objectiveId
          ? advanceObjectiveStep(objective, actionLog.completedAt)
          : objective,
      ),
    }
  }

  if (dailyAction.source === 'synthesis') {
    return {
      ...state,
      actionHistory: [actionLog, ...state.actionHistory],
      completedSynthesisFirstAction: true,
    }
  }

  return state
}

export function applyObjectiveStepCompletion(
  state: AppState,
  objectiveId: string,
): AppState {
  const objective = state.objectives.find((item) => item.id === objectiveId)

  if (!objective || !objective.nextSteps.some((step) => step.trim().length > 0)) {
    return state
  }

  const currentStep = objective.nextSteps.find((step) => step.trim().length > 0)?.trim()

  if (!currentStep) {
    return state
  }

  const actionLog = createActionLog(currentStep, 'in_progress_step', objectiveId)
  const advancedObjective = advanceObjectiveStep(objective, actionLog.completedAt)

  return {
    ...state,
    actionHistory: [actionLog, ...state.actionHistory],
    objectives: state.objectives.map((item) =>
      item.id === objectiveId ? advancedObjective : item,
    ),
  }
}
