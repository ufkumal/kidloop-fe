/**
 * Ana sayfa (authenticated /home) tipleri.
 *
 * Buradaki şekiller backend hazır olduğunda olduğu gibi kullanılabilir;
 * görsel bileşenler bu tiplere bağlıdır, mock veriye değil.
 */

/** Ebeveynin onboarding'i tamamlayıp tamamlamadığını temsil eder. */
export type HomeState = 'new-user' | 'returning-user'

/** `/api/home/status` yanıtındaki seçili son etkinlik. */
export interface LatestActivity {
  dailyPlanItemId: number
  activityId: number
  title: string
  /** ISO 8601 */
  selectedAt: string
}

export type HomeStatus =
  | { state: 'new-user' }
  | {
      state: 'returning-user'
      childId: number
      childName: string
      latestActivity: LatestActivity
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
