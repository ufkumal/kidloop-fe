'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Heart,
  MessageCircleHeart,
  PartyPopper,
  Sparkles,
} from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchTodayDailyPlan } from '@/lib/api/daily-plan'
import { useAuth } from '@/lib/auth/auth-context'
import type { DailyPlanActivity } from '@/lib/types/daily-plan'

export function SelectedActivityView() {
  const { activeChild } = useAuth()
  const childId = activeChild?.childId
  const childName = activeChild?.childName?.trim()
  const [activity, setActivity] = useState<DailyPlanActivity | null>(null)
  const [loading, setLoading] = useState(Boolean(childId))
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!childId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchTodayDailyPlan(childId, controller.signal)
      .then((plan) => {
        setActivity(plan.activities.find((item) => item.selected) ?? null)
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [childId, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-card ring-border">
        <CardContent>
          <LoadingState label="Seçtiğin etkinlik hazırlanıyor…" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <ApiErrorAlert error={error} title="Seçtiğin etkinlik yüklenemedi" onRetry={retry} />
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-6">
        <h1 className="text-2xl font-bold">Henüz bir etkinlik seçmedin</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Bugünün önerilerine dönüp birlikte yapmak istediğiniz etkinliği seçebilirsin.
        </p>
        <Button nativeButton={false} render={<Link href="/plan-ready" />}>
          Etkinliklere dön
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/plan-ready"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Bugünün planına dön
        </Link>
      </header>

      <Card className="relative overflow-hidden rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 size-52 rounded-full bg-orange-soft"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-primary-soft"
        />

        <CardContent className="relative flex flex-col items-center gap-7 text-center">
          <div className="relative flex size-28 items-center justify-center rounded-full bg-primary-soft text-primary sm:size-32">
            <Heart className="size-12 fill-primary/15 sm:size-14" aria-hidden="true" />
            <Sparkles
              className="absolute -top-1 -right-1 size-8 text-orange"
              aria-hidden="true"
            />
            <PartyPopper
              className="absolute -bottom-1 -left-2 size-7 text-purple"
              aria-hidden="true"
            />
          </div>

          <div className="flex max-w-xl flex-col items-center gap-3">
            <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
              Harika seçim!
            </Badge>
            <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
              “{activity.title}” sizi bekliyor
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {childName
                ? `${childName} ile şimdi ekranı bir kenara bırakıp birlikte oyun zamanı. Kusursuz olması gerekmiyor; merak edin, gülün ve anın tadını çıkarın.`
                : 'Şimdi ekranı bir kenara bırakıp birlikte oyun zamanı. Kusursuz olması gerekmiyor; merak edin, gülün ve anın tadını çıkarın.'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-warm px-4 py-2 text-sm font-semibold text-warm-foreground">
            <Clock className="size-4 text-orange" aria-hidden="true" />
            Yaklaşık {activity.durationMinutes} dakika
          </div>

          <div className="grid w-full max-w-xl gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-warm/60 p-4">
              <h2 className="font-heading font-bold">Aklında olsun</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activity.observationTip}
              </p>
            </div>
            <div className="rounded-2xl bg-primary-soft/70 p-4">
              <h2 className="flex items-center gap-2 font-heading font-bold">
                <MessageCircleHeart className="size-4 text-primary" aria-hidden="true" />
                Sonra yine buluşalım
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Etkinlik bitince buraya dön. Nasıl geçtiğini birkaç kısa soruyla bize anlatabilirsin.
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-primary">
            Haydi, iyi eğlenceler! Bu sayfa sizi burada bekliyor.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
