import { apiRequest } from '@/lib/api/client'
import type { DailyPlan } from '@/lib/types/daily-plan'

export async function fetchTodayDailyPlan(
  childId: string | number,
  signal?: AbortSignal,
): Promise<DailyPlan> {
  return apiRequest<DailyPlan>(
    `/api/children/${encodeURIComponent(childId)}/daily-plan/today`,
    { auth: true, signal },
  )
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
