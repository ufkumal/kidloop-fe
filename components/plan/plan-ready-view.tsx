'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, Clock, Sparkles } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { PlanPreviewCard } from '@/components/plan/plan-preview-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchTodayDailyPlan } from '@/lib/api/daily-plan'
import { useAuth } from '@/lib/auth/auth-context'
import type { DailyPlan } from '@/lib/types/daily-plan'

function planDateLabel(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date()

  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function PlanReadyView() {
  const { activeChild } = useAuth()
  const childName = activeChild?.childName?.trim()
  const childId = activeChild?.childId
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [loading, setLoading] = useState(Boolean(childId))
  const [loadError, setLoadError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!childId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    setPlan(null)

    fetchTodayDailyPlan(childId, controller.signal)
      .then(setPlan)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setLoadError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [childId, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <CalendarCheck className="size-3.5" aria-hidden="true" />
          {planDateLabel(plan?.planDate)}
        </span>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Bugünün planı hazır.</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {childName
            ? `${childName} için bugün önerdiğimiz kısa etkinlikler aşağıda.`
            : 'Çocuğunla bugün denemeniz için kısa etkinlikler seçtik.'}
        </p>
        {plan ? (
          <div className="flex w-fit items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-soft ring-1 ring-border">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Toplam {plan.totalDurationMinutes} dakika
            {plan.budgetMinutes !== plan.totalDurationMinutes
              ? ` · ${plan.budgetMinutes} dakikalık bütçe`
              : null}
          </div>
        ) : null}
      </header>

      <section aria-labelledby="plan-activities" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 id="plan-activities" className="font-heading text-xl font-bold">
            Bugünün etkinlikleri
          </h2>
          {!loading && plan?.activities.length ? (
            <p className="text-sm text-muted-foreground">
              Ayrıntıları ve farklı uygulama seçeneklerini görmek için bir etkinliğe dokun.
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="rounded-3xl shadow-soft ring-border">
                <CardContent>
                  <LoadingState label="Günlük plan yükleniyor…" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !childId ? (
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Günlük planı gösterebilmek için önce bir çocuk profili oluşturman gerekiyor.
            </p>
            <Button nativeButton={false} render={<Link href="/onboarding/identity" />}>
              Profili oluştur
            </Button>
          </div>
        ) : loadError ? (
          <ApiErrorAlert error={loadError} title="Günlük plan yüklenemedi" onRetry={retry} />
        ) : plan?.activities.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plan.activities.map((activity, index) => (
              <PlanPreviewCard key={activity.activityId} activity={activity} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <h3 className="flex items-center gap-2 font-heading text-lg font-bold">
              <Sparkles className="size-5 text-orange" aria-hidden="true" />
              Bugün için etkinlik bulunamadı
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Planın henüz hazırlanıyor olabilir. Biraz sonra tekrar deneyebilirsin.
            </p>
            <Button type="button" variant="outline" className="mt-2 w-fit" onClick={retry}>
              Tekrar kontrol et
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
