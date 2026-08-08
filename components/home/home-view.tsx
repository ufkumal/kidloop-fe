'use client'

import { useCallback, useEffect, useState } from 'react'
import { NewUserWelcome } from '@/components/home/new-user-welcome'
import { ReturningUserWelcome } from '@/components/home/returning-user-welcome'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { fetchHomeStatus } from '@/lib/api/home'
import { useAuth } from '@/lib/auth/auth-context'
import { MOCK_LAST_ACTIVITY } from '@/lib/mock/home'
import type { HomeState } from '@/lib/types/home'

export function HomeView() {
  const { activeChild } = useAuth()
  const childName = activeChild?.childName?.trim() || null
  const [homeState, setHomeState] = useState<HomeState | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setError(null)
    setHomeState(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadHomeStatus() {
      try {
        const response = await fetchHomeStatus(controller.signal)
        setHomeState(response.state)
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError)
      }
    }

    void loadHomeStatus()
    return () => controller.abort()
  }, [requestVersion])

  if (error) {
    return (
      <ApiErrorAlert
        error={error}
        title="Ana sayfa yüklenemedi"
        onRetry={retry}
      />
    )
  }

  if (!homeState) {
    return <LoadingState label="Ana sayfan hazırlanıyor…" />
  }

  return (
    <div className="flex flex-col gap-8">
      {homeState === 'new-user' ? (
        <NewUserWelcome />
      ) : (
        <ReturningUserWelcome
          activity={MOCK_LAST_ACTIVITY}
          childId={activeChild?.childId}
          childName={childName}
        />
      )}
    </div>
  )
}
