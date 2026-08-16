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
  /** Etkinlik ebeveyn tarafından bugünün planından seçildiğinde true. */
  selected?: boolean
}

export interface DailyPlan {
  planId: number
  childId: number
  /** YYYY-MM-DD */
  planDate: string
  budgetMinutes: number
  totalDurationMinutes: number
  activities: DailyPlanActivity[]
}
