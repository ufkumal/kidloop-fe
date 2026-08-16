'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, Eye, Gauge, Sparkles, Target } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { selectTodayActivity } from '@/lib/api/daily-plan'
import type { DailyPlanActivity } from '@/lib/types/daily-plan'
import { cn } from '@/lib/utils'

const TONES = [
  'bg-primary-soft text-primary',
  'bg-orange-soft text-orange',
  'bg-purple-soft text-purple',
] as const

const SLOT_LABELS: Record<string, string> = {
  STRENGTHEN: 'Pekiştirme',
  DEVELOP: 'Gelişim',
  EXPLORE: 'Keşif',
}

function slotLabel(slotType: string) {
  return SLOT_LABELS[slotType] ?? slotType
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex gap-3 rounded-2xl bg-warm/55 p-4">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-soft">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-heading font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </section>
  )
}

export function PlanPreviewCard({
  activity,
  index,
  childId,
}: {
  activity: DailyPlanActivity
  index: number
  childId: string
}) {
  const router = useRouter()
  const tone = TONES[index % TONES.length]
  const [pending, setPending] = useState(false)
  const [selectionError, setSelectionError] = useState<unknown>(null)

  async function handleSelect() {
    if (pending) return
    setPending(true)
    setSelectionError(null)

    try {
      await selectTodayActivity(childId, activity.activityId)
      router.push('/activity-selected')
    } catch (cause) {
      setSelectionError(cause)
      setPending(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`${activity.title} etkinliğinin detaylarını gör`}
        className="group block h-full w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <Card className="h-full rounded-3xl shadow-soft ring-border transition-all group-hover:-translate-y-0.5 group-hover:shadow-card group-focus-visible:ring-primary">
          <CardHeader className="gap-3">
            <span
              aria-hidden="true"
              className={cn('flex size-11 items-center justify-center rounded-2xl', tone)}
            >
              <Sparkles className="size-5" />
            </span>
            <CardTitle className="font-heading text-lg font-bold">{activity.title}</CardTitle>
            <CardDescription className="line-clamp-3 leading-relaxed">
              {activity.intro || activity.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {activity.durationMinutes} dakika
              </span>
              <Badge variant="secondary" className="w-fit rounded-full">
                {slotLabel(activity.slotType)}
              </Badge>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              Detayları gör
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn('rounded-full border-0', tone)}>
                {slotLabel(activity.slotType)}
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" />
                {activity.durationMinutes} dakika
              </span>
            </div>
            <DialogTitle>{activity.title}</DialogTitle>
            <DialogDescription>{activity.intro || activity.description}</DialogDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailSection icon={<Target className="size-4" />} title="Amaç">
              {activity.purpose}
            </DetailSection>
            <DetailSection icon={<Sparkles className="size-4" />} title="Neden önemli?">
              {activity.whyItMatters}
            </DetailSection>
            <DetailSection icon={<Gauge className="size-4" />} title="Daha kolay deneyin">
              {activity.easierVariation}
            </DetailSection>
            <DetailSection icon={<ArrowRight className="size-4" />} title="Biraz zorlaştırın">
              {activity.harderVariation}
            </DetailSection>
          </div>

          <DetailSection icon={<Eye className="size-4" />} title="Gözlem ipucu">
            {activity.observationTip}
          </DetailSection>

          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <ApiErrorAlert error={selectionError} title="Etkinlik seçilemedi" />
            <SubmitButton
              type="button"
              pending={pending}
              pendingLabel="Etkinlik seçiliyor…"
              className="w-full sm:w-fit sm:px-6"
              onClick={handleSelect}
            >
              Bu etkinliği seç
              <ArrowRight data-icon="inline-end" />
            </SubmitButton>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Seçtikten sonra etkinlik için hazırlık ekranına geçeceksin.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
