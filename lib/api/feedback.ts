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

import { ApiError, apiRequest } from '@/lib/api/client'
import type {
  ActivityFeedback,
  FeedbackQuestion,
  FeedbackQuestionOption,
  FeedbackQuestionType,
  VoiceRecordingPayload,
} from '@/lib/types/home'

interface BuildFeedbackInput {
  activityId: number
  childId?: number | null
  enjoyment?: string | null
  tags: string[]
  text?: string
  voiceRecording?: VoiceRecordingPayload | null
}

const QUESTION_TYPES: FeedbackQuestionType[] = [
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'FREE_TEXT',
]

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseOption(value: unknown): FeedbackQuestionOption | null {
  if (!value || typeof value !== 'object') return null
  const option = value as Record<string, unknown>
  if (
    typeof option.code !== 'string' ||
    !option.code.trim() ||
    typeof option.label !== 'string' ||
    !option.label.trim() ||
    !isFiniteNumber(option.displayOrder)
  ) {
    return null
  }
  return {
    code: option.code,
    label: option.label,
    displayOrder: option.displayOrder,
  }
}

function parseQuestion(value: unknown): FeedbackQuestion | null {
  if (!value || typeof value !== 'object') return null
  const question = value as Record<string, unknown>
  if (
    typeof question.code !== 'string' ||
    !question.code.trim() ||
    typeof question.body !== 'string' ||
    !question.body.trim() ||
    typeof question.type !== 'string' ||
    !QUESTION_TYPES.includes(question.type as FeedbackQuestionType) ||
    typeof question.required !== 'boolean' ||
    !isFiniteNumber(question.displayOrder) ||
    !(question.helperText === null || typeof question.helperText === 'string') ||
    !(question.maxLength === null || isFiniteNumber(question.maxLength)) ||
    !Array.isArray(question.options)
  ) {
    return null
  }

  const options = question.options.map(parseOption)
  if (options.some((option) => option === null)) return null
  if (question.type !== 'FREE_TEXT' && options.length === 0) return null

  return {
    code: question.code,
    body: question.body,
    helperText: question.helperText,
    type: question.type as FeedbackQuestionType,
    required: question.required,
    displayOrder: question.displayOrder,
    maxLength: question.maxLength,
    options: (options as FeedbackQuestionOption[]).sort(
      (first, second) => first.displayOrder - second.displayOrder,
    ),
  }
}

/** Ana sayfadaki geri bildirim formunun güncel soru şemasını getirir. */
export async function fetchFeedbackQuestions(signal?: AbortSignal): Promise<FeedbackQuestion[]> {
  const response = await apiRequest<unknown>('/api/home/feedback/questions', {
    auth: true,
    signal,
  })
  if (!response || typeof response !== 'object') {
    throw new ApiError('Geri bildirim soruları alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const values = (response as Record<string, unknown>).questions
  if (!Array.isArray(values)) {
    throw new ApiError('Geri bildirim soruları alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const questions = values.map(parseQuestion)
  if (questions.some((question) => question === null)) {
    throw new ApiError('Geri bildirim soruları alınamadı. Lütfen tekrar dene.', 502, response)
  }

  return (questions as FeedbackQuestion[]).sort(
    (first, second) => first.displayOrder - second.displayOrder,
  )
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
