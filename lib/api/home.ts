import { ApiError, apiRequest } from '@/lib/api/client'
import type {
  ActivityFeedback,
  ActivityFeedbackType,
  HomeStatus,
  HomeStatusChild,
  LatestActivity,
  OnboardingStep,
} from '@/lib/types/home'

const FEEDBACK_TYPES: ActivityFeedbackType[] = ['LIKED', 'STRUGGLED', 'DISLIKED']

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isDateOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
}

function parseFeedback(value: unknown): ActivityFeedback | null {
  if (!value || typeof value !== 'object') return null
  const feedback = value as Record<string, unknown>
  if (
    !isNumber(feedback.feedbackId) ||
    typeof feedback.feedbackType !== 'string' ||
    !FEEDBACK_TYPES.includes(feedback.feedbackType as ActivityFeedbackType) ||
    !(feedback.resolvedReason == null || typeof feedback.resolvedReason === 'string') ||
    !(feedback.freeText == null || typeof feedback.freeText === 'string') ||
    typeof feedback.createdAt !== 'string' ||
    Number.isNaN(Date.parse(feedback.createdAt))
  ) {
    return null
  }
  return {
    feedbackId: feedback.feedbackId,
    feedbackType: feedback.feedbackType as ActivityFeedbackType,
    resolvedReason: typeof feedback.resolvedReason === 'string' ? feedback.resolvedReason : null,
    freeText: typeof feedback.freeText === 'string' ? feedback.freeText : null,
    createdAt: feedback.createdAt,
  }
}

function parseLatestActivity(value: unknown): LatestActivity | null {
  if (!value || typeof value !== 'object') return null
  const activity = value as Record<string, unknown>
  const instructionSource =
    activity.instructions && typeof activity.instructions === 'object'
      ? (activity.instructions as Record<string, unknown>)
      : activity
  const instructionFields = [
    'intro',
    'purpose',
    'whyItMatters',
    'easierVariation',
    'harderVariation',
    'observationTip',
  ] as const

  if (
    !isNumber(activity.dailyPlanItemId) ||
    !isNumber(activity.activityId) ||
    !isNumber(activity.durationMinutes) ||
    typeof activity.title !== 'string' ||
    !activity.title.trim() ||
    typeof activity.description !== 'string' ||
    typeof activity.slotType !== 'string' ||
    instructionFields.some((field) => typeof instructionSource[field] !== 'string') ||
    typeof activity.selectedAt !== 'string' ||
    Number.isNaN(Date.parse(activity.selectedAt)) ||
    !isDateOrNull(activity.completedAt) ||
    typeof activity.feedbackSubmitted !== 'boolean'
  ) {
    return null
  }

  const feedback = activity.feedback == null ? null : parseFeedback(activity.feedback)
  if (activity.feedback != null && !feedback) return null

  return {
    dailyPlanItemId: activity.dailyPlanItemId,
    activityId: activity.activityId,
    title: activity.title.trim(),
    description: activity.description as string,
    durationMinutes: activity.durationMinutes,
    slotType: activity.slotType as string,
    intro: instructionSource.intro as string,
    purpose: instructionSource.purpose as string,
    whyItMatters: instructionSource.whyItMatters as string,
    easierVariation: instructionSource.easierVariation as string,
    harderVariation: instructionSource.harderVariation as string,
    observationTip: instructionSource.observationTip as string,
    selectedAt: activity.selectedAt,
    completedAt: activity.completedAt,
    feedbackSubmitted: activity.feedbackSubmitted,
    feedback,
  }
}

function invalid(response: unknown): never {
  throw new ApiError('Ana sayfa durumu alınamadı. Lütfen tekrar dene.', 502, response)
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  'DAILY_TIME_BUDGET',
  'QUESTIONNAIRE',
  'CONSENTS',
]

function parseChild(value: unknown): HomeStatusChild | null {
  if (!value || typeof value !== 'object') return null
  const child = value as Record<string, unknown>
  if (
    !isNumber(child.childId) ||
    !(child.fullName == null || typeof child.fullName === 'string') ||
    !(child.displayName == null || typeof child.displayName === 'string') ||
    typeof child.birthDate !== 'string' ||
    Number.isNaN(Date.parse(child.birthDate)) ||
    !isNumber(child.ageMonths) ||
    typeof child.ageBand !== 'string' ||
    !(child.gender == null || typeof child.gender === 'string')
  ) {
    return null
  }
  return {
    childId: child.childId,
    fullName: typeof child.fullName === 'string' && child.fullName.trim() ? child.fullName.trim() : null,
    displayName:
      typeof child.displayName === 'string' && child.displayName.trim()
        ? child.displayName.trim()
        : null,
    birthDate: child.birthDate,
    ageMonths: child.ageMonths,
    ageBand: child.ageBand,
    gender: typeof child.gender === 'string' ? child.gender : null,
  }
}

/** Authenticated parent'ın ana sayfa deneyimini backend'den getirir. */
export async function fetchHomeStatus(signal?: AbortSignal): Promise<HomeStatus> {
  const response = await apiRequest<unknown>('/api/home/status', { auth: true, signal })
  if (!response || typeof response !== 'object') invalid(response)

  const status = response as Record<string, unknown>
  if (status.state === 'new-user') {
    return {
      state: 'new-user',
      ...(typeof status.shouldGenerateDailyPlan === 'boolean'
        ? { shouldGenerateDailyPlan: status.shouldGenerateDailyPlan }
        : {}),
      ...(typeof status.shouldListExistingPlan === 'boolean'
        ? { shouldListExistingPlan: status.shouldListExistingPlan }
        : {}),
    }
  }

  if (status.state === 'half-onboarding-user') {
    const child = parseChild(status.child)
    if (
      !child ||
      !isNumber(status.childId) ||
      status.childId !== child.childId ||
      typeof status.childName !== 'string' ||
      !status.childName.trim() ||
      typeof status.onboardingStep !== 'string' ||
      !ONBOARDING_STEPS.includes(status.onboardingStep as OnboardingStep) ||
      !(status.nextQuestionCode == null || typeof status.nextQuestionCode === 'string') ||
      !(status.nextConsentId == null || isNumber(status.nextConsentId)) ||
      status.shouldGenerateDailyPlan !== false ||
      !(status.shouldListExistingPlan == null || status.shouldListExistingPlan === false)
    ) {
      invalid(response)
    }
    return {
      state: 'half-onboarding-user',
      childId: status.childId,
      childName: child.displayName ?? child.fullName ?? status.childName.trim(),
      child,
      onboardingStep: status.onboardingStep as OnboardingStep,
      nextQuestionCode:
        typeof status.nextQuestionCode === 'string' ? status.nextQuestionCode : null,
      nextConsentId: isNumber(status.nextConsentId) ? status.nextConsentId : null,
      shouldGenerateDailyPlan: false,
      shouldListExistingPlan: false,
    }
  }

  if (
    (status.state !== 'feedback-required' && status.state !== 'returning-user') ||
    !isNumber(status.childId) ||
    typeof status.childName !== 'string' ||
    !status.childName.trim() ||
    typeof status.shouldGenerateDailyPlan !== 'boolean' ||
    typeof status.shouldListExistingPlan !== 'boolean'
  ) {
    invalid(response)
  }

  const latestActivity = status.latestActivity == null
    ? null
    : parseLatestActivity(status.latestActivity)

  if (status.latestActivity != null && !latestActivity) invalid(response)

  if (
    status.state === 'feedback-required' &&
    status.shouldGenerateDailyPlan === false &&
    status.shouldListExistingPlan === false &&
    latestActivity &&
    latestActivity.completedAt === null &&
    latestActivity.feedbackSubmitted === false
  ) {
    return {
      state: 'feedback-required',
      childId: status.childId,
      childName: status.childName.trim(),
      shouldGenerateDailyPlan: false,
      shouldListExistingPlan: false,
      latestActivity,
    }
  }

  if (
    status.state === 'returning-user' &&
    status.shouldGenerateDailyPlan !== status.shouldListExistingPlan &&
    (!latestActivity ||
      (latestActivity.completedAt !== null &&
        latestActivity.feedbackSubmitted === true &&
        latestActivity.feedback !== null))
  ) {
    return {
      state: 'returning-user',
      childId: status.childId,
      childName: status.childName.trim(),
      shouldGenerateDailyPlan: status.shouldGenerateDailyPlan,
      shouldListExistingPlan: status.shouldListExistingPlan,
      latestActivity,
    }
  }

  return invalid(response)
}
