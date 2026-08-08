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
 * - POST /api/children   body: identity question answers
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

/**
 * Kimlik sorularındaki cevaplardan çocuk profili oluşturur. Alan adları API'nin
 * `answerKey` değeriyle belirlenir. Günlük süre sorusu halen `answerKey` olmadan
 * döndüğü için bilinen soru kodu çocuk oluşturma alanına eşlenir.
 */
export async function submitIdentityAnswers(input: {
  childId: string | null
  answers: IdentityAnswers
  questions: NormalizedQuestion[]
}): Promise<IdentityResult> {
  const { answers, questions } = input

  const payloadBody: Record<string, string> = {}

  for (const question of questions) {
    const value = answers[question.code]?.trim()
    if (!value) continue

    const fieldName = question.answerKey ?? getIdentityPayloadField(question)
    if (fieldName) payloadBody[fieldName] = value
  }

  const fullName = payloadBody.fullName ?? ''
  const birthDate = payloadBody.birthDate ?? ''

  if (!birthDate) {
    throw new ApiError('Çocuğun doğum tarihi eksiksiz girilmelidir.', 400)
  }

  const payload = await apiRequest<unknown>('/api/children', {
    method: 'POST',
    auth: true,
    body: payloadBody,
  })
  const childId = extractChildId(payload)

  if (!childId) {
    throw new ApiError('Çocuk profili oluşturuldu ancak sunucudan çocuk kimliği alınamadı.', 500)
  }

  return {
    childId,
    childName: extractChildName(payload) ?? (fullName || null),
  }
}

function getIdentityPayloadField(question: NormalizedQuestion): string | null {
  if (question.code === 'Q7') return 'dailyTimeBudgetOptionCode'
  if (question.code === 'Q8') return 'gender'
  if (question.type === 'DATE') return 'birthDate'
  if (question.type === 'TEXT') return 'fullName'
  return null
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
