import aiCoachData from '../data/aiCoachData.json'
import type { Objective, ObjectiveDraft, ObjectiveDifficulty } from '../types/capclair.types'

const allowedActionLabels = new Set(aiCoachData.objectives.actionLabels as string[])
const allowedDifficulties = new Set<ObjectiveDifficulty>(['easy', 'medium', 'hard'])

const nextQuarterDeadline = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().slice(0, 10)
}

const sanitizeText = (value: string) => value.trim()

const sanitizeDifficulty = (value: ObjectiveDifficulty): ObjectiveDifficulty =>
  allowedDifficulties.has(value) ? value : 'medium'

const sanitizeActionLabel = (value: string) =>
  allowedActionLabels.has(value) ? value : (aiCoachData.objectives.actionLabels[0] as string)

export function mapObjectiveDraftsToObjectives(drafts: ObjectiveDraft[]): Objective[] {
  return drafts.map((draft, index) => ({
    id: `obj-${index + 1}-${Date.now()}`,
    title: sanitizeText(draft.title),
    actionLabel: sanitizeActionLabel(draft.actionLabel),
    description: sanitizeText(draft.description),
    deepReason: sanitizeText(draft.deepReason),
    obstacles: draft.obstacles.map(sanitizeText).filter(Boolean),
    motivation: sanitizeText(draft.motivation),
    nextSteps: draft.nextSteps.map(sanitizeText).filter(Boolean),
    status: index === 0 ? 'in_progress' : 'todo',
    difficulty: sanitizeDifficulty(draft.difficulty),
    deadline: nextQuarterDeadline(),
    progressHistory: [],
  }))
}
