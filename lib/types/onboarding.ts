/**
 * Backend sözleşmesi henüz sabitlenmediği için ham (raw) tipler geniş tutulur,
 * uygulama içinde ise normalize edilmiş tipler kullanılır.
 * Normalizasyon: lib/onboarding/normalize.ts
 */

export type QuestionInputType =
  | 'TEXT'
  | 'DATE'
  | 'NUMBER'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'UNSUPPORTED'

export interface QuestionOption {
  code: string
  body: string
  label: string
  description?: string
}

export interface NormalizedQuestion {
  /** Backend'in beklediği soru kodu */
  code: string
  body: string
  title: string
  description?: string
  type: QuestionInputType
  /** Normalize edilemeyen tipler için ham değer (fallback UI'da gösterilir) */
  rawType?: string
  required: boolean
  placeholder?: string
  options: QuestionOption[]
  answeredOptionCode?: string | null
  answeredValue?: string | null
  order?: number
}

/** GET /api/onboarding/identity-questions (normalize edilmiş) */
export interface IdentityQuestions {
  questions: NormalizedQuestion[]
}

/** GET /api/children/{childId}/questionnaire/current (normalize edilmiş) */
export interface QuestionnaireState {
  childId?: number | string | null
  childName?: string | null
  nextQuestionCode: string | null
  questions: NormalizedQuestion[]
  answeredCount: number
  totalQuestions: number
  completed: boolean
}

/** PUT /api/children/{childId}/questionnaire/answers/{questionCode} */
export interface AnswerOptionRequest {
  optionCode: string
}

/** Kimlik adımında toplanan cevaplar: { questionCode: değer } */
export type IdentityAnswers = Record<string, string>

/** Kimlik gönderimi sonrası elde edilen çocuk bilgisi */
export interface IdentityResult {
  childId: string
  childName?: string | null
}

/** Ham API yanıtları için gevşek tipler */
export type RawRecord = Record<string, unknown>
