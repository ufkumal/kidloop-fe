'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewUserWelcome } from '@/components/home/new-user-welcome'
import { HalfOnboardingReminder } from '@/components/home/half-onboarding-reminder'
import { ReturningUserWelcome } from '@/components/home/returning-user-welcome'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { fetchFeedbackQuestions } from '@/lib/api/feedback'
import { useAuth } from '@/lib/auth/auth-context'
import type { FeedbackQuestion } from '@/lib/types/home'

export function HomeView() {
  const router = useRouter()
  const { homeStatus, resolveHomeStatus } = useAuth()
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([])
  const [error, setError] = useState<unknown>(null)

  const retry = useCallback(() => {
    setError(null)
    setQuestions([])
    void resolveHomeStatus()
      .then((resolution) => router.replace(resolution.path))
      .catch(setError)
  }, [resolveHomeStatus, router])

  useEffect(() => {
    if (homeStatus || error) return
    retry()
  }, [homeStatus, error, retry])

  useEffect(() => {
    if (homeStatus?.state !== 'feedback-required') {
      setQuestions([])
      return
    }
    const controller = new AbortController()
    void fetchFeedbackQuestions(controller.signal)
      .then(setQuestions)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError)
      })
    return () => controller.abort()
  }, [homeStatus])

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

  if (homeStatus.state === 'new-user') {
    return <NewUserWelcome />
  }

  if (homeStatus.state === 'half-onboarding-user') {
    return <HalfOnboardingReminder status={homeStatus} />
  }

  return (
    <ReturningUserWelcome
      status={homeStatus}
      questions={questions}
      onFeedbackSubmitted={retry}
    />
  )
}
