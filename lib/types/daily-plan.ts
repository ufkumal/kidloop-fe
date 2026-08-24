export type DailyPlanSlotType = 'STRENGTHEN' | 'DEVELOP' | string

export interface DailyPlanStep {
  stepNo: number
  text: string
}

export interface DailyPlanMaterial {
  name: string
  category: string | null
  quantity: string | number | null
  optional: boolean
  displayOrder: number
  note: string | null
}

export interface DailyPlanOutcome {
  displayOrder: number
  outcome: string
}

export interface DailyPlanActivity {
  dailyPlanItemId: number
  activityId: number
  title: string
  description: string
  durationMinutes: number
  slotType: DailyPlanSlotType
  score: number
  intro: string
  purpose: string
  whyItMatters: string
  easierVariation: string
  harderVariation: string
  observationTip: string
  safetyNotes: string | null
  cleanupNotes: string | null
  steps: DailyPlanStep[]
  materials: DailyPlanMaterial[]
  outcomes: DailyPlanOutcome[]
  withinBudget: boolean
  repeatNotice: boolean
  /** Etkinlik ebeveyn tarafından bugünün planından seçildiğinde true. */
  selected?: boolean
}

export interface DailyPlan {
  planId: number
  childId: number
  /** YYYY-MM-DD */
  planDate: string
  budgetMin: number
  budgetMax: number
  committedDurationMinutes: number
  totalDurationMinutes: number
  fallbackLevel: number
  activities: DailyPlanActivity[]
  state: string
}
