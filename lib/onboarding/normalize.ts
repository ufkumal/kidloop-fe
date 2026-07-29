import type {
  NormalizedQuestion,
  QuestionInputType,
  QuestionOption,
  QuestionnaireState,
  RawRecord,
} from '@/lib/types/onboarding'

/**
 * Backend alan adları henüz kesinleşmediği için okuma katmanı esnek tutulur.
 * Soru başlıkları / seçenekleri asla koda gömülmez, hepsi API yanıtından okunur.
 */

function pick(record: RawRecord, keys: string[]): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  if (typeof value === 'number') return String(value)
  return undefined
}

function asRecordArray(value: unknown): RawRecord[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is RawRecord => Boolean(item) && typeof item === 'object')
}

const TYPE_MAP: Record<string, QuestionInputType> = {
  TEXT: 'TEXT',
  STRING: 'TEXT',
  SHORT_TEXT: 'TEXT',
  FREE_TEXT: 'TEXT',
  CHILD_NAME: 'TEXT',
  NAME: 'TEXT',
  DATE: 'DATE',
  BIRTH_DATE: 'DATE',
  BIRTHDATE: 'DATE',
  DATE_OF_BIRTH: 'DATE',
  LOCAL_DATE: 'DATE',
  NUMBER: 'NUMBER',
  INTEGER: 'NUMBER',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  SINGLE_SELECT: 'SINGLE_CHOICE',
  RADIO: 'SINGLE_CHOICE',
  MULTI_CHOICE: 'MULTI_CHOICE',
  MULTIPLE_CHOICE: 'MULTI_CHOICE',
  MULTI_SELECT: 'MULTI_CHOICE',
}

/** Soru kodu / başlığından tip çıkarımı (backend tip vermezse son çare). */
function inferType(code: string, title: string, hasOptions: boolean): QuestionInputType {
  if (hasOptions) return 'SINGLE_CHOICE'
  const haystack = `${code} ${title}`.toLocaleLowerCase('tr')
  if (/(dogum|doğum|birth|dob|tarih|date)/.test(haystack)) return 'DATE'
  if (/(isim|ad[ıi]|name)/.test(haystack)) return 'TEXT'
  return 'TEXT'
}

function normalizeOption(raw: RawRecord, index: number): QuestionOption {
  const code =
    asString(pick(raw, ['optionCode', 'code', 'value', 'key', 'id'])) ?? `option-${index + 1}`
  const body =
    asString(pick(raw, ['body', 'label', 'title', 'text', 'displayName', 'name', 'optionText'])) ??
    code
  return {
    code,
    body,
    label: body,
    description: asString(pick(raw, ['description', 'hint', 'subtitle', 'helpText'])),
  }
}

export function normalizeQuestion(raw: RawRecord, index: number): NormalizedQuestion {
  const code =
    asString(pick(raw, ['questionCode', 'code', 'key', 'name', 'id'])) ?? `question-${index + 1}`
  const body =
    asString(pick(raw, ['body', 'title', 'text', 'label', 'question', 'prompt', 'questionText'])) ??
    code

  const optionSource = pick(raw, ['options', 'answerOptions', 'choices', 'values'])
  const options = asRecordArray(optionSource).map(normalizeOption)

  const rawType = asString(pick(raw, ['type', 'questionType', 'inputType', 'answerType', 'format']))
  const mapped = rawType ? TYPE_MAP[rawType.toUpperCase()] : undefined
  const type: QuestionInputType = mapped ?? inferType(code, body, options.length > 0)

  const requiredRaw = pick(raw, ['required', 'isRequired', 'mandatory'])
  const answered = pick(raw, ['answeredOptionCode', 'selectedOptionCode', 'answerOptionCode'])
  const answeredValue = pick(raw, ['answerValue', 'answeredValue', 'value', 'answer'])

  return {
    code,
    body,
    title: body,
    description: asString(pick(raw, ['description', 'helpText', 'hint', 'subtitle', 'why'])),
    type,
    rawType: mapped ? undefined : rawType,
    required: requiredRaw === undefined ? true : Boolean(requiredRaw),
    placeholder: asString(pick(raw, ['placeholder', 'example'])),
    options,
    answeredOptionCode: asString(answered) ?? null,
    answeredValue: asString(answeredValue) ?? null,
    order:
      typeof raw.displayOrder === 'number'
        ? raw.displayOrder
        : typeof raw.order === 'number'
          ? raw.order
          : undefined,
  }
}

export function normalizeQuestionList(payload: unknown): NormalizedQuestion[] {
  const source = Array.isArray(payload)
    ? payload
    : pick((payload ?? {}) as RawRecord, ['questions', 'items', 'data', 'content', 'result'])

  return asRecordArray(source)
    .map(normalizeQuestion)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function normalizeQuestionnaire(payload: unknown): QuestionnaireState {
  const record = (payload ?? {}) as RawRecord
  const questions = normalizeQuestionList(record)

  const answeredFromApi = pick(record, ['answeredCount', 'answered', 'completedCount'])
  const totalFromApi = pick(record, ['totalQuestions', 'total', 'questionCount'])

  const answeredCount =
    typeof answeredFromApi === 'number'
      ? answeredFromApi
      : questions.filter((q) => Boolean(q.answeredOptionCode ?? q.answeredValue)).length

  const totalQuestions = typeof totalFromApi === 'number' ? totalFromApi : questions.length

  const nextQuestionCode =
    asString(pick(record, ['nextQuestionCode', 'nextQuestion', 'currentQuestionCode'])) ?? null

  const completedFlag = pick(record, ['completed', 'isCompleted', 'finished'])

  return {
    childId: asString(pick(record, ['childId', 'id'])) ?? null,
    childName: asString(pick(record, ['childName', 'name', 'child'])) ?? null,
    nextQuestionCode,
    questions,
    answeredCount,
    totalQuestions,
    completed:
      completedFlag !== undefined
        ? Boolean(completedFlag)
        : nextQuestionCode === null && totalQuestions > 0 && answeredCount >= totalQuestions,
  }
}

/** Kimlik gönderimi yanıtından childId çıkarır. */
export function extractChildId(payload: unknown): string | null {
  if (!payload) return null
  if (typeof payload === 'number' || typeof payload === 'string') {
    const direct = asString(payload)
    return direct && /^\d+$/.test(direct) ? direct : null
  }
  if (typeof payload !== 'object') return null

  const record = payload as RawRecord
  const direct = asString(pick(record, ['childId', 'id', 'childID']))
  if (direct) return direct

  for (const key of ['child', 'data', 'result', 'content']) {
    const nested = record[key]
    if (nested && typeof nested === 'object') {
      const found = extractChildId(nested)
      if (found) return found
    }
  }
  return null
}

export function extractChildName(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as RawRecord
  const direct = asString(pick(record, ['childName', 'fullName', 'name', 'firstName']))
  if (direct) return direct
  for (const key of ['child', 'data', 'result']) {
    const nested = record[key]
    if (nested && typeof nested === 'object') {
      const found = extractChildName(nested)
      if (found) return found
    }
  }
  return null
}
