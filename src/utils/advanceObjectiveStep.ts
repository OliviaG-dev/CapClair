import type { CompletedStep, Objective } from '../types/capclair.types'

const STEP_COMPLETED_NOTE_PREFIX = 'Étape terminée :'

export function findCurrentStep(nextSteps: string[]): string | undefined {
  return nextSteps.map((step) => step.trim()).find((step) => step.length > 0)
}

export function advanceObjectiveStep(
  objective: Objective,
  completedAt = new Date().toISOString(),
): Objective {
  const currentStep = findCurrentStep(objective.nextSteps)

  if (!currentStep) {
    return objective
  }

  const currentIndex = objective.nextSteps.findIndex((step) => step.trim() === currentStep)
  const remainingSteps = objective.nextSteps.slice(currentIndex + 1)
  const completedEntry: CompletedStep = {
    id: crypto.randomUUID(),
    text: currentStep,
    completedAt,
  }
  const hasRemainingSteps = findCurrentStep(remainingSteps) != null
  const nextStatus =
    !hasRemainingSteps && objective.status === 'in_progress' ? 'done' : objective.status

  return {
    ...objective,
    nextSteps: remainingSteps,
    completedSteps: [completedEntry, ...objective.completedSteps],
    status: nextStatus,
    progressHistory: [
      {
        id: crypto.randomUUID(),
        createdAt: completedAt,
        note: `${STEP_COMPLETED_NOTE_PREFIX} ${currentStep}`,
        delta: 1,
      },
      ...objective.progressHistory,
    ],
  }
}
