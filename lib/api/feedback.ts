/**
 * Etkinlik geri bildirimi gönderimi.
 *
 * TODO(backend): Şu anda gerçek bir istek atılmıyor. Kidloop geri bildirim ucu
 * ve AI ajanı hazır olduğunda bu dosyadaki submitActivityFeedback fonksiyonu
 * lib/api/client.ts üzerinden gerçek çağrıya dönüştürülecek. Örnek:
 *
 *   return apiRequest<void>('/activities/feedback', {
 *     method: 'POST',
 *     body: feedback,
 *   })
 *
 * Görsel bileşenlerde başka hiçbir yerde mock gönderim mantığı bulunmaz.
 */

import type { ActivityFeedback, EnjoymentLevel, VoiceRecordingPayload } from '@/lib/types/home'

interface BuildFeedbackInput {
  activityId: string
  childId?: string | null
  enjoyment?: EnjoymentLevel | null
  tags: string[]
  text?: string
  voiceRecording?: VoiceRecordingPayload | null
}

/** Görsel durumdan backend'e uygun gövdeyi üretir. */
export function buildActivityFeedback({
  activityId,
  childId,
  enjoyment,
  tags,
  text,
  voiceRecording,
}: BuildFeedbackInput): ActivityFeedback {
  const trimmedText = text?.trim()

  return {
    activityId,
    ...(childId ? { childId } : {}),
    ...(enjoyment ? { enjoyment } : {}),
    tags,
    ...(trimmedText ? { text: trimmedText } : {}),
    ...(voiceRecording ? { voiceRecording } : {}),
    submittedAt: new Date().toISOString(),
  }
}

/** En az bir anlamlı girdi var mı? */
export function hasMeaningfulFeedback({
  enjoyment,
  tags,
  text,
  voiceRecording,
}: Pick<BuildFeedbackInput, 'enjoyment' | 'tags' | 'text' | 'voiceRecording'>) {
  return Boolean(
    enjoyment ||
      tags.length > 0 ||
      (text?.trim()?.length ?? 0) > 0 ||
      (voiceRecording?.durationSeconds ?? 0) > 0,
  )
}

/** TODO(backend): Kidloop backend + AI ajanı ucuna bağlanacak. */
export async function submitActivityFeedback(feedback: ActivityFeedback): Promise<void> {
  console.log('[v0] mock submitActivityFeedback payload:', feedback)
  await new Promise((resolve) => setTimeout(resolve, 900))
}
