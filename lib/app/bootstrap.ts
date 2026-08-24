import { fetchHomeStatus } from '@/lib/api/home'
import { getStoredToken } from '@/lib/auth/storage'
import type { HomeStatus } from '@/lib/types/home'
import { routeForHomeStatus } from '@/lib/app/routes.mjs'

export { onboardingContinuationPath, routeForHomeStatus } from '@/lib/app/routes.mjs'

export const STATUS_RESOLUTION_EVENT = 'kidloop:resolve-status'

export interface InitialRouteResolution {
  status: HomeStatus
  path: string
}

let pendingResolution: Promise<InitialRouteResolution> | null = null
let pendingToken: string | null = null

/** Concurrent callers share one status request; a later call always rechecks the backend. */
export function resolveInitialRoute(): Promise<InitialRouteResolution> {
  const token = getStoredToken()
  if (pendingResolution && pendingToken === token) return pendingResolution

  const request = fetchHomeStatus()
    .then((status) => ({ status, path: routeForHomeStatus(status) }))
    .finally(() => {
      if (pendingResolution === request) {
        pendingResolution = null
        pendingToken = null
      }
    })
  pendingResolution = request
  pendingToken = token
  return request
}

export function requestStatusResolution() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STATUS_RESOLUTION_EVENT))
  }
}
