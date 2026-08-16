'use client'

import { useCallback, useEffect, useState } from 'react'
import { NewUserWelcome } from '@/components/home/new-user-welcome'
import { ReturningUserWelcome } from '@/components/home/returning-user-welcome'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { fetchHomeStatus } from '@/lib/api/home'
import { fetchFeedbackQuestions } from '@/lib/api/feedback'
import type { FeedbackQuestion, HomeStatus } from '@/lib/types/home'

export function HomeView() {
  const [homeStatus, setHomeStatus] = useState<HomeStatus | null>(null)
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([])
  const [error, setError] = useState<unknown>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setError(null)
    setHomeStatus(null)
    setQuestions([])
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadHomeStatus() {
      try {
        const response = await fetchHomeStatus(controller.signal)
        if (response.state === 'returning-user') {
          const feedbackQuestions = await fetchFeedbackQuestions(controller.signal)
          setQuestions(feedbackQuestions)
        }
        setHomeStatus(response)
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

  if (!homeStatus) {
    return <LoadingState label="Ana sayfan hazırlanıyor…" />
  }

  return (
    <div className="flex flex-col gap-8">
      {homeStatus.state === 'new-user' ? (
        <NewUserWelcome />
      ) : (
        <ReturningUserWelcome
          activity={homeStatus.latestActivity}
          childId={homeStatus.childId}
          childName={homeStatus.childName}
          questions={questions}
        />
      )}
    </div>
  )
}
