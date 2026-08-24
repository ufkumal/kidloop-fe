import { ApiError, apiRequest } from '@/lib/api/client'
import { requestStatusResolution } from '@/lib/app/bootstrap'
import type { DailyPlan } from '@/lib/types/daily-plan'

export async function fetchTodayDailyPlan(
  childId: string | number,
  signal?: AbortSignal,
): Promise<DailyPlan> {
  try {
    return await apiRequest<DailyPlan>(
      `/api/children/${encodeURIComponent(childId)}/daily-plan/today`,
      { auth: true, signal },
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) requestStatusResolution()
    throw error
  }
}

export async function selectTodayActivity(
  childId: string,
  activityId: number,
): Promise<DailyPlan> {
  return apiRequest<DailyPlan>(
    `/api/children/${encodeURIComponent(childId)}/daily-plan/today/selection`,
    {
      method: 'POST',
      auth: true,
      body: { activityId },
    },
  )
}
