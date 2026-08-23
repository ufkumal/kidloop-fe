export type DailyPlanSlotType = 'STRENGTHEN' | 'DEVELOP' | string

export interface DailyPlanActivity {
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
