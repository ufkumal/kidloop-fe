'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Clock3, Pencil } from 'lucide-react'
import { DynamicQuestionRenderer } from '@/components/onboarding/dynamic-question-renderer'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  fetchOnboardingDailyTimeBudget,
  updateOnboardingDailyTimeBudget,
} from '@/lib/api/onboarding'
import type { DailyTimeBudgetQuestion, NormalizedQuestion } from '@/lib/types/onboarding'

export function DailyTimeBudgetStep({ childId }: { childId: string }) {
  const router = useRouter()
  const [budget, setBudget] = useState<DailyTimeBudgetQuestion | null>(null)
  const [value, setValue] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    fetchOnboardingDailyTimeBudget(childId, controller.signal)
      .then((result) => {
        setBudget(result)
        setValue(result.selectedOptionCode ?? '')
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [childId, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])
  const question = useMemo<NormalizedQuestion | null>(() => {
    if (!budget) return null
    return {
      code: budget.questionCode,
      body: budget.question,
      title: budget.question,
      type: 'SINGLE_CHOICE',
      required: true,
      options: budget.options.map((option) => ({
        code: option.code,
        body: option.label,
        label: option.label,
        description: `${option.minMinutes}–${option.maxMinutes} dakika`,
      })),
    }
  }, [budget])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    if (!value.trim()) {
      setFieldError('Devam etmek için bir seçim yapman gerekiyor.')
      return
    }
    setFieldError(null)
    setPending(true)

    try {
      await updateOnboardingDailyTimeBudget(childId, value.trim())
      router.push(`/onboarding/${encodeURIComponent(childId)}/questions`)
    } catch (cause) {
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Clock3 className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          Son bir kısa adım
        </span>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">
          Etkinlikleri günlük temponuza uyduralım
        </h1>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Ayırabildiğin süreye uygun etkinlikler önerebilmemiz için sana en uygun seçeneği belirt.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          nativeButton={false}
          render={
            <Link
              href={`/onboarding/${encodeURIComponent(childId)}/identity?returnTo=${encodeURIComponent(`/onboarding/${childId}/daily-time-budget`)}`}
            />
          }
        >
          <Pencil data-icon="inline-start" />
          Çocuk bilgilerini düzenle
        </Button>
      </header>

      <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardContent>
          {loading ? (
            <LoadingState label="Zaman seçenekleri yükleniyor…" />
          ) : loadError ? (
            <ApiErrorAlert
              error={loadError}
              title="Zaman seçenekleri yüklenemedi"
              onRetry={retry}
            />
          ) : question ? (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
              <DynamicQuestionRenderer
                question={question}
                value={value}
                onChange={(next) => {
                  setValue(next)
                  setFieldError(null)
                }}
                error={fieldError}
                disabled={pending}
                emphasis
              />

              <ApiErrorAlert error={submitError} title="Zaman tercihi kaydedilemedi" />

              <SubmitButton pending={pending} pendingLabel="Kaydediliyor…">
                Devam et
                <ArrowRight data-icon="inline-end" />
              </SubmitButton>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
