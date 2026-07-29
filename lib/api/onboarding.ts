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
 * - POST /api/children   body: { fullName, birthDate }
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
 * Kimlik sorularındaki ad ve doğum tarihi cevaplarından çocuk profili oluşturur.
 * Cevaplar soru kodlarıyla saklanır; alanların anlamı API'den gelen soru tipiyle
 * belirlenir, böylece ekrandaki metne bağımlı kalınmaz.
 */
export async function submitIdentityAnswers(input: {
  childId: string | null
  answers: IdentityAnswers
  questions: NormalizedQuestion[]
}): Promise<IdentityResult> {
  const { answers, questions } = input

  const nameQuestion = questions.find((question) => question.type === 'TEXT')
  const birthDateQuestion = questions.find((question) => question.type === 'DATE')
  const fullName = nameQuestion ? answers[nameQuestion.code]?.trim() : ''
  const birthDate = birthDateQuestion ? answers[birthDateQuestion.code]?.trim() : ''

  if (!fullName || !birthDate) {
    throw new ApiError('Çocuğun adı ve doğum tarihi eksiksiz girilmelidir.', 400)
  }

  const payload = await apiRequest<unknown>('/api/children', {
    method: 'POST',
    auth: true,
    body: { fullName, birthDate },
  })
  const childId = extractChildId(payload)

  if (!childId) {
    throw new ApiError('Çocuk profili oluşturuldu ancak sunucudan çocuk kimliği alınamadı.', 500)
  }

  return {
    childId,
    childName: extractChildName(payload) ?? fullName,
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
