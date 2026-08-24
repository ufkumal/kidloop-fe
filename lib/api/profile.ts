import { ApiError, apiRequest } from '@/lib/api/client'
import type {
  ChildProfile,
  DailyTimeBudget,
  DailyTimeBudgetOption,
  DailyTimeBudgetUpdate,
  OnboardingAnswer,
  ProfileData,
  ProfileTone,
  SuggestedActivity,
} from '@/lib/types/profile'

type UnknownRecord = Record<string, unknown>

const DOMAIN_LABELS: Record<string, string> = {
  LANGUAGE: 'Dil gelişimi',
  COGNITIVE: 'Bilişsel gelişim',
  FINE_MOTOR: 'İnce motor',
  GROSS_MOTOR: 'Kaba motor',
  SOCIAL_EMOTIONAL: 'Sosyal-duygusal gelişim',
  SENSORY: 'Duyusal gelişim',
}

const INVOLVEMENT_LABELS: Record<string, string> = {
  BIRLIKTE: 'Birlikte',
  COCUK_TEK: 'Bağımsız',
  TEK_BASINA: 'Bağımsız',
  EBEVEYN_GOZETIMINDE: 'Ebeveyn gözetiminde',
}

const GENDER_LABELS: Record<string, string> = {
  FEMALE: 'Kız',
  MALE: 'Erkek',
  OTHER: 'Diğer',
}

const PREFERENCE_LABELS: Record<string, string> = {
  BALANCED: 'Dengeli öneriler',
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function requiredNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function formatDate(value: string): string | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatShortDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tarih belirtilmedi'
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(date)
}

function formatAge(ageMonths: number | null): string | null {
  if (ageMonths === null || ageMonths < 0) return null
  if (ageMonths < 24) return `${ageMonths} aylık`
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  return months === 0 ? `${years} yaş` : `${years} yaş ${months} aylık`
}

function normalizeAnswers(value: unknown): OnboardingAnswer[] {
  if (!Array.isArray(value)) return []

  return value
    .filter(isRecord)
    .sort(
      (left, right) =>
        (requiredNumber(left.displayOrder) ?? 0) - (requiredNumber(right.displayOrder) ?? 0),
    )
    .map((answer, index) => ({
      id: optionalString(answer.questionCode) || `answer-${index}`,
      question: optionalString(answer.question) || 'Soru',
      answer: optionalString(answer.displayValue) || optionalString(answer.value) || null,
    }))
}

function normalizeChild(value: unknown): ChildProfile | null {
  if (!isRecord(value)) return null
  const childId = requiredNumber(value.childId)
  const name = optionalString(value.displayName) || optionalString(value.fullName)
  if (childId === null || !name) return null

  const ageMonths = requiredNumber(value.ageMonths)
  const ageLabel = formatAge(ageMonths)
  const gender = GENDER_LABELS[optionalString(value.gender)]
  const preference = PREFERENCE_LABELS[optionalString(value.preferenceMode)]

  return {
    summary: {
      childId: String(childId),
      name,
      avatarUrl: null,
      ageLabel,
      birthDateLabel: formatDate(optionalString(value.birthDate)),
      birthDate: optionalString(value.birthDate) || null,
      gender: optionalString(value.gender) || null,
      highlights: [ageLabel, gender, preference].filter((item): item is string => Boolean(item)),
    },
    onboardingAnswers: normalizeAnswers(value.onboardingAnswers),
  }
}

/** Ebeveyn, çocuk kimlikleri ve onboarding cevaplarını getirir. */
export async function fetchProfile(signal?: AbortSignal): Promise<ProfileData> {
  const response = await apiRequest<unknown>('/api/profile', { auth: true, signal })
  if (!isRecord(response) || !isRecord(response.parent) || !Array.isArray(response.children)) {
    throw new ApiError('Profil bilgileri alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const parentId = requiredNumber(response.parent.parentProfileId)
  const email = optionalString(response.parent.email)
  if (parentId === null || !email) {
    throw new ApiError('Ebeveyn profil bilgileri eksik geldi. Lütfen tekrar dene.', 502, response)
  }

  const children = response.children
    .map(normalizeChild)
    .filter((child): child is ChildProfile => child !== null)
  return {
    parent: {
      fullName: optionalString(response.parent.fullName),
      email,
      phone: optionalString(response.parent.phone),
      city: optionalString(response.parent.city),
      district: optionalString(response.parent.district),
      avatarUrl: null,
    },
    children,
  }
}

function normalizeTimeBudgetOption(value: unknown): DailyTimeBudgetOption | null {
  if (!isRecord(value)) return null
  const code = optionalString(value.code)
  const label = optionalString(value.label)
  const displayOrder = requiredNumber(value.displayOrder)
  const minutes = requiredNumber(value.minutes)
  if (!code || !label || displayOrder === null || minutes === null) return null
  return { code, label, displayOrder, minutes }
}

/** Günlük zaman bütçesi sorusunu, seçeneklerini ve mevcut cevabı getirir. */
export async function fetchDailyTimeBudget(signal?: AbortSignal): Promise<DailyTimeBudget> {
  const response = await apiRequest<unknown>('/api/profile/daily-time-budget', {
    auth: true,
    signal,
  })

  if (!isRecord(response) || !Array.isArray(response.options)) {
    throw new ApiError('Günlük zaman bütçesi alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const questionCode = optionalString(response.questionCode)
  const question = optionalString(response.question)
  const options = response.options
    .map(normalizeTimeBudgetOption)
    .filter((option): option is DailyTimeBudgetOption => option !== null)
    .sort((left, right) => left.displayOrder - right.displayOrder)

  if (!questionCode || !question || options.length === 0) {
    throw new ApiError('Günlük zaman bütçesi bilgileri eksik geldi.', 502, response)
  }

  const selectedOptionCode = optionalString(response.selectedOptionCode) || null
  return {
    questionCode,
    question,
    selectedOptionCode,
    dailyTimeBudgetMinutes: requiredNumber(response.dailyTimeBudgetMinutes),
    options,
  }
}

/** Ebeveynin günlük zaman bütçesi cevabını günceller. */
export async function updateDailyTimeBudget(optionCode: string): Promise<DailyTimeBudgetUpdate> {
  const response = await apiRequest<unknown>('/api/onboarding/daily-time-budget', {
    method: 'PUT',
    auth: true,
    body: { optionCode },
  })

  if (!isRecord(response)) {
    throw new ApiError('Günlük zaman bütçesi güncellenemedi. Lütfen tekrar dene.', 502, response)
  }

  const answeredOptionCode = optionalString(response.answeredOptionCode)
  const dailyTimeBudgetMinutes = requiredNumber(response.dailyTimeBudgetMinutes)
  if (!answeredOptionCode || dailyTimeBudgetMinutes === null) {
    throw new ApiError('Günlük zaman bütçesi yanıtı eksik geldi.', 502, response)
  }

  return { answeredOptionCode, dailyTimeBudgetMinutes }
}

function toneFor(activityId: number): ProfileTone {
  return (['primary', 'orange', 'purple'] as const)[Math.abs(activityId) % 3]
}

/** Seçili çocuğun daha önce önerilen ve tamamlanan etkinliklerini getirir. */
export async function fetchActivityHistory(
  childId: string,
  signal?: AbortSignal,
): Promise<SuggestedActivity[]> {
  const response = await apiRequest<unknown>(
    `/api/children/${encodeURIComponent(childId)}/activity-history?page=0&size=99`,
    { auth: true, signal },
  )

  if (!isRecord(response) || !Array.isArray(response.activities)) {
    throw new ApiError('Etkinlik geçmişi alınamadı. Lütfen tekrar dene.', 502, response)
  }

  return response.activities.filter(isRecord).map((activity, index) => {
    const activityId = requiredNumber(activity.activityId) ?? index
    const completed = activity.completed === true || Boolean(optionalString(activity.completedAt))
    return {
      id: String(requiredNumber(activity.dailyPlanItemId) ?? `activity-${activityId}-${index}`),
      title: optionalString(activity.title) || 'İsimsiz etkinlik',
      description: optionalString(activity.description),
      duration: `${requiredNumber(activity.durationMinutes) ?? 0} dakika`,
      involvement:
        INVOLVEMENT_LABELS[optionalString(activity.involvementType)] ||
        optionalString(activity.involvementType) ||
        'Katılım bilgisi yok',
      skill:
        DOMAIN_LABELS[optionalString(activity.targetDomain)] ||
        optionalString(activity.targetDomain) ||
        'Gelişim alanı belirtilmedi',
      suggestedAtLabel: formatShortDate(
        optionalString(activity.selectedAt) || optionalString(activity.planDate),
      ),
      status: completed ? 'completed' : 'pending',
      tone: toneFor(activityId),
    }
  })
}
