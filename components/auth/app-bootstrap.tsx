'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { STATUS_RESOLUTION_EVENT } from '@/lib/app/bootstrap'
import { useAuth } from '@/lib/auth/auth-context'

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, isAuthenticated, isRestoring, resolveHomeStatus } = useAuth()
  const resolvedToken = useRef<string | null>(null)
  const resolvedAttempt = useRef(-1)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)
  const needsInitialResolution = Boolean(
    isAuthenticated &&
      session?.role === 'PARENT' &&
      resolvedToken.current !== session.token,
  )

  const resolve = useCallback(async () => {
    setResolving(true)
    setError(null)
    try {
      const result = await resolveHomeStatus()
      resolvedToken.current = session?.token ?? null
      router.replace(result.path)
    } catch (cause) {
      setError(cause)
    } finally {
      setResolving(false)
    }
  }, [resolveHomeStatus, router, session?.token])

  useEffect(() => {
    if (isRestoring) return
    if (!isAuthenticated || session?.role !== 'PARENT') {
      resolvedToken.current = null
      resolvedAttempt.current = -1
      return
    }
    if (resolvedToken.current === session.token && resolvedAttempt.current === attempt) return
    resolvedAttempt.current = attempt
    void resolve()
  }, [isRestoring, isAuthenticated, session, attempt, resolve])

  useEffect(() => {
    if (!isAuthenticated || session?.role !== 'PARENT') return
    const handleResolutionRequest = () => void resolve()
    window.addEventListener(STATUS_RESOLUTION_EVENT, handleResolutionRequest)
    return () => window.removeEventListener(STATUS_RESOLUTION_EVENT, handleResolutionRequest)
  }, [isAuthenticated, session?.role, resolve])

  if (
    isRestoring ||
    (isAuthenticated &&
      session?.role === 'PARENT' &&
      (resolving || (needsInitialResolution && !error)))
  ) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20">
        <LoadingState label="Kidloop kaldığın yeri buluyor…" variant="spinner" />
      </div>
    )
  }

  if (isAuthenticated && session?.role === 'PARENT' && error) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20">
        <ApiErrorAlert
          error={error}
          title="Kaldığın yer belirlenemedi"
          onRetry={() => setAttempt((current) => current + 1)}
        />
      </div>
    )
  }

  return <>{children}</>
}
