import { ApiError, apiRequest } from '@/lib/api/client'
import {
  extractChildId,
  extractChildName,
  normalizeQuestionList,
  normalizeQuestionnaire,
} from '@/lib/onboarding/normalize'
import type {
  IdentityAnswers,
  IdentityResult,
  NormalizedQuestion,
  QuestionnaireState,
} from '@/lib/types/onboarding'

/**
 * Backend sözleşmesinde tanımlı uçlar:
 * - GET  /api/onboarding/identity-questions
 * - GET  /api/children/{childId}/questionnaire/current
 * - PUT  /api/children/{childId}/questionnaire/answers/{questionCode}   body: { optionCode }
 * - POST /api/children/{childId}/questionnaire/complete
 *
 * Bu dosya dışında hiçbir yerde uç adresi geçmez; sözleşme değişirse
 * yalnızca burası güncellenir.
 */

export interface IdentityQuestionsResult {
  questions: NormalizedQuestion[]
  /** Backend yanıtında çocuk referansı varsa buradan okunur (V2: mevcut çocukla devam etme). */
  childId: string | null
  childName: string | null
}

export async function fetchIdentityQuestions(
  signal?: AbortSignal,
): Promise<IdentityQuestionsResult> {
  const payload = await apiRequest<unknown>('/api/onboarding/identity-questions', {
    auth: true,
    signal,
  })

  return {
    questions: normalizeQuestionList(payload),
    childId: extractChildId(payload),
    childName: extractChildName(payload),
  }
}

/**
 * Cevap gövdesi. Sözleşmede yalnızca `optionCode` tanımlı olduğu için
 * serbest metin/tarih cevapları da bu alanla gönderilir.
 * Sözleşme genişlediğinde değiştirilecek tek yer burasıdır.
 */
function buildAnswerBody(value: string): { optionCode: string } {
  return { optionCode: value }
}

export async function submitAnswer(
  childId: string,
  questionCode: string,
  value: string,
): Promise<QuestionnaireState> {
  const payload = await apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/questionnaire/answers/${encodeURIComponent(
      questionCode,
    )}`,
    { method: 'PUT', auth: true, body: buildAnswerBody(value) },
  )
  return normalizeQuestionnaire(payload)
}

export const IDENTITY_CHILD_REFERENCE_MISSING =
  'Kimlik bilgilerini kaydetmek için gereken çocuk referansı sunucudan gelmedi. Bu adım backend tarafında tamamlandığında otomatik olarak çalışacak.'

/**
 * Kimlik adımı cevapları, sözleşmede tanımlı cevap ucu üzerinden gönderilir.
 * Yeni bir uç uydurulmaz: childId yalnızca identity-questions yanıtından okunur.
 */
export async function submitIdentityAnswers(input: {
  childId: string | null
  answers: IdentityAnswers
  questions: NormalizedQuestion[]
}): Promise<IdentityResult> {
  const { childId, answers, questions } = input

  if (!childId) {
    throw new ApiError(IDENTITY_CHILD_REFERENCE_MISSING, 0)
  }

  let latest: QuestionnaireState | null = null
  for (const question of questions) {
    const value = answers[question.code]
    if (value === undefined || value === '') continue
    latest = await submitAnswer(childId, question.code, value)
  }

  return {
    childId,
    childName: latest?.childName ?? null,
  }
}

export async function fetchCurrentQuestionnaire(
  childId: string,
  signal?: AbortSignal,
): Promise<QuestionnaireState> {
  const payload = await apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/questionnaire/current`,
    { auth: true, signal },
  )
  return normalizeQuestionnaire(payload)
}

export async function completeQuestionnaire(childId: string): Promise<unknown> {
  return apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/questionnaire/complete`,
    { method: 'POST', auth: true },
  )
}
