/** Ana sayfa durum API'sinin desteklediği kullanıcı akışları. */
export type HomeState = 'new-user' | 'feedback-required' | 'returning-user'

export type ActivityFeedbackType = 'LIKED' | 'STRUGGLED' | 'DISLIKED'

export interface ActivityFeedback {
  feedbackId: number
  feedbackType: ActivityFeedbackType
  resolvedReason: string | null
  freeText: string | null
  /** ISO 8601 */
  createdAt: string
}

/** `/api/home/status` yanıtındaki en son seçilmiş etkinlik. */
export interface LatestActivity {
  dailyPlanItemId: number
  activityId: number
  title: string
  description: string
  durationMinutes: number
  slotType: string
  intro: string
  purpose: string
  whyItMatters: string
  easierVariation: string
  harderVariation: string
  observationTip: string
  /** ISO 8601 */
  selectedAt: string
  /** ISO 8601; etkinlik henüz tamamlanmadıysa null. */
  completedAt: string | null
  feedbackSubmitted: boolean
  feedback: ActivityFeedback | null
}

export type HomeStatus =
  | { state: 'new-user'; shouldGenerateDailyPlan?: boolean }
  | {
      state: 'feedback-required'
      childId: number
      childName: string
      shouldGenerateDailyPlan: false
      latestActivity: LatestActivity
    }
  | {
      state: 'returning-user'
      childId: number
      childName: string
      shouldGenerateDailyPlan: true
      latestActivity: LatestActivity | null
    }

export type FeedbackQuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'FREE_TEXT'

export interface FeedbackQuestionOption {
  code: string
  label: string
  displayOrder: number
}

export interface FeedbackQuestion {
  code: string
  body: string
  helperText: string | null
  type: FeedbackQuestionType
  required: boolean
  displayOrder: number
  maxLength: number | null
  options: FeedbackQuestionOption[]
}

/** Sesli geri bildirim desteği eklendiğinde kullanılacak tarayıcı kaydı. */
export interface VoiceRecordingPayload {
  localUrl?: string
  durationSeconds: number
}
