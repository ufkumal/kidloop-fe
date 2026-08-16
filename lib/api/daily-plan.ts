import { apiRequest } from '@/lib/api/client'
import type { DailyPlan } from '@/lib/types/daily-plan'

export async function fetchTodayDailyPlan(
  childId: string,
  signal?: AbortSignal,
): Promise<DailyPlan> {
  return apiRequest<DailyPlan>(
    `/api/children/${encodeURIComponent(childId)}/daily-plan/today`,
    { auth: true, signal },
  )
}
