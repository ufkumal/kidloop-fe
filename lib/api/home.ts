import { ApiError, apiRequest } from '@/lib/api/client'
import type { HomeState } from '@/lib/types/home'

interface HomeStatusResponse {
  state: HomeState
}

/** Authenticated parent'ın ana sayfa deneyimini backend'den getirir. */
export async function fetchHomeStatus(signal?: AbortSignal): Promise<HomeStatusResponse> {
  const response = await apiRequest<unknown>('/api/home/status', {
    auth: true,
    signal,
  })

  if (
    !response ||
    typeof response !== 'object' ||
    !['new-user', 'returning-user'].includes(
      String((response as Record<string, unknown>).state),
    )
  ) {
    throw new ApiError('Ana sayfa durumu alınamadı. Lütfen tekrar dene.', 502, response)
  }

  return response as HomeStatusResponse
}
