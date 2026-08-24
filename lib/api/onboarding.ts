import { ApiError, apiRequest } from '@/lib/api/client'
import {
  extractChildId,
  extractChildName,
  normalizeQuestionList,
  normalizeQuestionnaire,
} from '@/lib/onboarding/normalize'
import type {
  ChildIdentityUpdate,
  DailyTimeBudgetQuestion,
  IdentityAnswers,
  IdentityResult,
  NormalizedQuestion,
  QuestionnaireState,
} from '@/lib/types/onboarding'

/**
 * Backend sözleşmesinde tanımlı uçlar:
 * - GET  /api/onboarding/identity-questions
 * - POST /api/children   body: identity question answers
 * - GET  /api/children/{childId}/onboarding/daily-time-budget
 * - PUT  /api/children/{childId}/onboarding/daily-time-budget   body: { optionCode }
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
 * `answerKey` değeriyle belirlenir; günlük süre tercihi çocuk oluşturulduktan
 * sonra çocuğa özel daily-time-budget ucuna ayrı olarak gönderilir.
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

/** Mevcut çocuk kimliğini günceller; yaş bandı değişirse backend questionnaire'ı sıfırlar. */
export async function updateChildIdentity(
  childId: string,
  input: { fullName: string | null; birthDate: string; gender: string | null },
): Promise<ChildIdentityUpdate> {
  const payload = await apiRequest<unknown>(`/api/children/${encodeURIComponent(childId)}`, {
    method: 'PUT',
    auth: true,
    body: input,
  })
  if (!isRecord(payload)) {
    throw new ApiError('Çocuk bilgileri güncellenemedi. Lütfen tekrar dene.', 502, payload)
  }

  const responseChildId = requiredNumber(payload.childId)
  const birthDate = requiredString(payload.birthDate)
  const ageMonths = requiredNumber(payload.ageMonths)
  const ageBand = requiredString(payload.ageBand)
  if (
    responseChildId === null ||
    !birthDate ||
    ageMonths === null ||
    !ageBand ||
    typeof payload.questionnaireRestarted !== 'boolean'
  ) {
    throw new ApiError('Güncellenen çocuk bilgileri eksik geldi.', 502, payload)
  }

  return {
    childId: String(responseChildId),
    fullName: requiredString(payload.fullName),
    displayName: requiredString(payload.displayName),
    birthDate,
    ageMonths,
    ageBand,
    gender: requiredString(payload.gender),
    questionnaireRestarted: payload.questionnaireRestarted,
  }
}

function getIdentityPayloadField(question: NormalizedQuestion): string | null {
  if (question.code === 'Q8') return 'gender'
  if (question.type === 'DATE') return 'birthDate'
  if (question.type === 'TEXT') return 'fullName'
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function requiredNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/** Çocuğa özel günlük etkinlik süresi sorusunu ve seçeneklerini getirir. */
export async function fetchOnboardingDailyTimeBudget(
  childId: string,
  signal?: AbortSignal,
): Promise<DailyTimeBudgetQuestion> {
  const payload = await apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/onboarding/daily-time-budget`,
    { auth: true, signal },
  )

  if (!isRecord(payload) || !Array.isArray(payload.options)) {
    throw new ApiError('Günlük zaman bütçesi sorusu alınamadı. Lütfen tekrar dene.', 502, payload)
  }

  const questionCode = requiredString(payload.questionCode)
  const question = requiredString(payload.question)
  const options = payload.options
    .map((option) => {
      if (!isRecord(option)) return null
      const code = requiredString(option.code)
      const label = requiredString(option.label)
      const displayOrder = requiredNumber(option.displayOrder)
      const minMinutes = requiredNumber(option.minMinutes)
      const maxMinutes = requiredNumber(option.maxMinutes)
      if (!code || !label || displayOrder === null || minMinutes === null || maxMinutes === null) {
        return null
      }
      return { code, label, displayOrder, minMinutes, maxMinutes }
    })
    .filter((option): option is NonNullable<typeof option> => option !== null)
    .sort((left, right) => left.displayOrder - right.displayOrder)

  if (!questionCode || !question || options.length === 0) {
    throw new ApiError('Günlük zaman bütçesi bilgileri eksik geldi.', 502, payload)
  }

  return {
    questionCode,
    question,
    selectedOptionCode: requiredString(payload.selectedOptionCode),
    minMinutes: requiredNumber(payload.minMinutes),
    maxMinutes: requiredNumber(payload.maxMinutes),
    options,
  }
}

/** Çocuğa özel günlük etkinlik süresi seçimini kaydeder. */
export async function updateOnboardingDailyTimeBudget(
  childId: string,
  optionCode: string,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/onboarding/daily-time-budget`,
    { method: 'PUT', auth: true, body: { optionCode } },
  )
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
    { method: 'POST', auth: true, body: {} },
  )
}
