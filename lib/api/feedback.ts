import { ApiError, apiRequest } from '@/lib/api/client'
import type {
  ActivityFeedbackType,
  FeedbackQuestion,
  FeedbackQuestionOption,
  FeedbackQuestionType,
} from '@/lib/types/home'

const QUESTION_TYPES: FeedbackQuestionType[] = [
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'FREE_TEXT',
]

export const MAX_FREE_TEXT_FEEDBACK_LENGTH = 500

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

/** Seçilen soru seçeneğinin kodunu etkinlik geri bildirimi olarak gönderir. */
export async function submitActivityFeedback(
  childId: number,
  dailyPlanItemId: number,
  feedbackType: ActivityFeedbackType,
  freeText?: string,
): Promise<void> {
  if (freeText && freeText.length > MAX_FREE_TEXT_FEEDBACK_LENGTH) {
    throw new RangeError(
      `Geri bildirim en fazla ${MAX_FREE_TEXT_FEEDBACK_LENGTH} karakter olabilir.`,
    )
  }

  await apiRequest<void>(
    `/api/children/${encodeURIComponent(childId)}/daily-plan/items/${encodeURIComponent(dailyPlanItemId)}/feedback`,
    {
      method: 'POST',
      auth: true,
      body: { feedbackType, ...(freeText?.trim() ? { freeText: freeText.trim() } : {}) },
    },
  )
}
