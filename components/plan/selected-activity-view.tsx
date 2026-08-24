'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  Eye,
  Heart,
  ListChecks,
  MessageCircleHeart,
  PackageCheck,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'
import { readSelectedActivity } from '@/lib/plan/selected-activity-storage'
import type { DailyPlanActivity } from '@/lib/types/daily-plan'

function GuideSection({
  icon,
  title,
  children,
  tone = 'bg-warm/60',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  tone?: string
}) {
  return (
    <section className={`rounded-2xl p-5 ${tone}`}>
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function SelectedActivityView() {
  const router = useRouter()
  const { activeChild, resolveHomeStatus } = useAuth()
  const childId = activeChild?.childId
  const childName = activeChild?.childName?.trim()
  const [activity, setActivity] = useState<DailyPlanActivity | null>(null)
  const [loading, setLoading] = useState(Boolean(childId))
  const [feedbackError, setFeedbackError] = useState<unknown>(null)
  const [feedbackPending, setFeedbackPending] = useState(false)

  useEffect(() => {
    if (!childId) {
      setLoading(false)
      return
    }

    setActivity(readSelectedActivity(childId))
    setLoading(false)
  }, [childId])

  async function handleFeedback() {
    if (feedbackPending) return
    setFeedbackError(null)
    setFeedbackPending(true)

    try {
      await resolveHomeStatus()
      router.push('/home#feedback')
    } catch (cause) {
      setFeedbackError(cause)
      setFeedbackPending(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-card ring-border">
        <CardContent>
          <LoadingState label="Seçtiğin etkinlik hazırlanıyor…" />
        </CardContent>
      </Card>
    )
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

        <CardContent className="relative flex flex-col gap-8">
          <div className="flex flex-col items-center gap-7 text-center">
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
                {activity.description}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-warm px-4 py-2 text-sm font-semibold text-warm-foreground">
              <Clock className="size-4 text-orange" aria-hidden="true" />
              Yaklaşık {activity.durationMinutes} dakika
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <GuideSection icon={<Target className="size-4" />} title="Amaç" tone="bg-primary-soft/70">
              <p>{activity.purpose}</p>
            </GuideSection>

            <GuideSection icon={<PackageCheck className="size-4" />} title="Malzemeler">
              {activity.materials.length ? (
                <ul className="flex flex-col gap-2">
                  {[...activity.materials]
                    .sort((left, right) => left.displayOrder - right.displayOrder)
                    .map((material, index) => (
                      <li key={`${material.name}-${index}`}>
                        <span className="font-semibold text-foreground">
                          {material.quantity ? `${material.quantity} × ` : null}
                          {material.name}
                          {material.optional ? ' (isteğe bağlı)' : null}
                        </span>
                        {material.note ? <span className="block">{material.note}</span> : null}
                      </li>
                    ))}
                </ul>
              ) : (
                <p>Bu etkinlik için özel bir malzeme gerekmiyor.</p>
              )}
            </GuideSection>
          </div>

          <GuideSection icon={<Sparkles className="size-4" />} title="Başlamadan önce">
            <p>{activity.intro}</p>
          </GuideSection>

          <GuideSection
            icon={<ListChecks className="size-4" />}
            title="Adım adım yapılışı"
            tone="bg-card ring-1 ring-border"
          >
            <ol className="flex flex-col gap-3">
              {[...activity.steps]
                .sort((left, right) => left.stepNo - right.stepNo)
                .map((step) => (
                  <li key={step.stepNo} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.stepNo}
                    </span>
                    <span className="pt-1">{step.text}</span>
                  </li>
                ))}
            </ol>
          </GuideSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <GuideSection icon={<ArrowLeft className="size-4" />} title="Daha kolay deneyin">
              <p>{activity.easierVariation}</p>
            </GuideSection>
            <GuideSection
              icon={<ArrowUpRight className="size-4" />}
              title="Biraz zorlaştırın"
              tone="bg-primary-soft/70"
            >
              <p>{activity.harderVariation}</p>
            </GuideSection>
          </div>

          <GuideSection icon={<Eye className="size-4" />} title="Gözlem ipucu">
            <p>{activity.observationTip}</p>
          </GuideSection>

          {activity.safetyNotes ? (
            <GuideSection
              icon={<ShieldCheck className="size-4" />}
              title="Güvenlik notu"
              tone="bg-orange-soft/70"
            >
              <p className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden="true" />
                <span>{activity.safetyNotes}</span>
              </p>
            </GuideSection>
          ) : null}

          {activity.cleanupNotes ? (
            <GuideSection icon={<Trash2 className="size-4" />} title="Toparlama notu">
              <p>{activity.cleanupNotes}</p>
            </GuideSection>
          ) : null}

          <div className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
            <p className="text-sm font-semibold text-primary">
              {childName ? `${childName} ile iyi eğlenceler!` : 'Haydi, iyi eğlenceler!'}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="size-3.5" aria-hidden="true" />
              Etkinlik bitince nasıl geçtiğini anlatmak için buraya dönebilirsin.
            </p>
            <ApiErrorAlert error={feedbackError} title="Geri bildirim sayfası açılamadı" />
            <SubmitButton
              type="button"
              pending={feedbackPending}
              pendingLabel="Geri bildirim açılıyor…"
              onClick={handleFeedback}
              className="mt-3 w-full sm:w-fit sm:px-6"
            >
              Nasıl geçtiğini bize anlat
              <MessageCircleHeart data-icon="inline-end" />
            </SubmitButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
