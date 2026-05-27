export type ObjectiveStatus = 'todo' | 'in_progress' | 'done'

export type ObjectiveDifficulty = 'easy' | 'medium' | 'hard'

export type QuestionnaireAnswers = {
  changeWish: string
  heaviestWeight: string
  improvementFocus: string
  blockingFactor: string
  energySource: string
  progressVision: string
}

export type ProgressEntry = {
  id: string
  createdAt: string
  note: string
  delta: number
}

export type Objective = {
  id: string
  title: string
  description: string
  deepReason: string
  obstacles: string[]
  motivation: string
  nextSteps: string[]
  status: ObjectiveStatus
  difficulty: ObjectiveDifficulty
  deadline: string
  progressHistory: ProgressEntry[]
}

export type Synthesis = {
  wantsToChange: string
  blockers: string
  importantThemes: string[]
  suggestedGoals: string[]
  firstAction: string
}

export type JournalEntry = {
  id: string
  createdAt: string
  mood: number
  energy: number
  note: string
}

export type AppState = {
  answers: QuestionnaireAnswers | null
  synthesis: Synthesis | null
  objectives: Objective[]
  journal: JournalEntry[]
}
