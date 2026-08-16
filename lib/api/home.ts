import { ApiError, apiRequest } from '@/lib/api/client'
import type { HomeStatus } from '@/lib/types/home'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Authenticated parent'ın ana sayfa deneyimini backend'den getirir. */
export async function fetchHomeStatus(signal?: AbortSignal): Promise<HomeStatus> {
  const response = await apiRequest<unknown>('/api/home/status', {
    auth: true,
    signal,
  })

  if (!response || typeof response !== 'object') {
    throw new ApiError('Ana sayfa durumu alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const status = response as Record<string, unknown>
  if (status.state === 'new-user') return { state: 'new-user' }

  const latestActivity = status.latestActivity
  if (
    status.state !== 'returning-user' ||
    !isNumber(status.childId) ||
    typeof status.childName !== 'string' ||
    !status.childName.trim() ||
    !latestActivity ||
    typeof latestActivity !== 'object'
  ) {
    throw new ApiError('Ana sayfa durumu alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const activity = latestActivity as Record<string, unknown>
  if (
    !isNumber(activity.dailyPlanItemId) ||
    !isNumber(activity.activityId) ||
    typeof activity.title !== 'string' ||
    !activity.title.trim() ||
    typeof activity.selectedAt !== 'string' ||
    Number.isNaN(Date.parse(activity.selectedAt))
  ) {
    throw new ApiError('Son etkinlik bilgileri alınamadı. Lütfen tekrar dene.', 502, response)
  }

  return {
    state: 'returning-user',
    childId: status.childId,
    childName: status.childName.trim(),
    latestActivity: {
      dailyPlanItemId: activity.dailyPlanItemId,
      activityId: activity.activityId,
      title: activity.title.trim(),
      selectedAt: activity.selectedAt,
    },
  }
}
