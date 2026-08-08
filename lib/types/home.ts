/**
 * Ana sayfa (authenticated /home) tipleri.
 *
 * Buradaki şekiller backend hazır olduğunda olduğu gibi kullanılabilir;
 * görsel bileşenler bu tiplere bağlıdır, mock veriye değil.
 */

/** Ebeveynin onboarding'i tamamlayıp tamamlamadığını temsil eder. */
export type HomeState = 'new-user' | 'returning-user'

/** Çocuğun etkinlikten ne kadar keyif aldığı. */
export type EnjoymentLevel = 'loved' | 'somewhat' | 'not_interested'

/** Ana sayfada gösterilen "son etkinlik" özeti. */
export interface LastActivitySummary {
  id: string
  title: string
  /** Örn. "15 dakika" */
  duration: string
  /** Örn. "Ev içi" */
  place: string
  /** Örn. "Dikkat & eşleştirme" */
  skill: string
  /** Örn. "Dün" — backend hazır olduğunda tarih formatlanarak gelecek. */
  completedLabel: string
  tone: 'primary' | 'orange' | 'purple'
}

/** Ebeveynin ses kaydı (şimdilik yalnızca tarayıcı içinde tutulur). */
export interface VoiceRecordingPayload {
  localUrl?: string
  durationSeconds: number
}

/** Backend ve AI ajanına gönderilecek geri bildirim gövdesi. */
export interface ActivityFeedback {
  activityId: string
  childId?: string
  enjoyment?: EnjoymentLevel
  tags: string[]
  text?: string
  voiceRecording?: VoiceRecordingPayload
  /** ISO 8601 */
  submittedAt: string
}
