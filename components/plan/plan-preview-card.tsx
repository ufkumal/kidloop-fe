'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Clock, Sparkles, Target } from 'lucide-react'
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
import { writeSelectedActivity } from '@/lib/plan/selected-activity-storage'
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
        <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
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
  const isCompleted = Boolean(activity.completedAt)
  const isSelected = Boolean(activity.selectedAt)

  async function handleSelect() {
    if (pending || isCompleted) return

    if (isSelected) {
      writeSelectedActivity(childId, activity)
      router.push('/activity-selected')
      return
    }

    setPending(true)
    setSelectionError(null)

    try {
      const plan = await selectTodayActivity(childId, activity.activityId)
      const selectedActivity = plan.activities.find(
        (item) => item.activityId === activity.activityId,
      )
      if (!selectedActivity) {
        throw new Error('Seçilen etkinlik yanıt içinde bulunamadı.')
      }
      writeSelectedActivity(childId, selectedActivity)
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
        <Card
          className={cn(
            'h-full rounded-3xl shadow-soft ring-border transition-all group-focus-visible:ring-primary',
            isCompleted
              ? 'opacity-50 grayscale-[35%]'
              : 'group-hover:-translate-y-0.5 group-hover:shadow-card',
          )}
        >
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
            <DialogDescription>{activity.description}</DialogDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailSection icon={<Target className="size-4" />} title="Amaç">
              {activity.purpose}
            </DetailSection>
            <DetailSection icon={<Sparkles className="size-4" />} title="Neden önemli?">
              {activity.whyItMatters}
            </DetailSection>
          </div>

          {activity.outcomes.length ? (
            <DetailSection icon={<Check className="size-4" />} title="Kazanımlar">
              <ul className="flex flex-col gap-1.5">
                {[...activity.outcomes]
                  .sort((left, right) => left.displayOrder - right.displayOrder)
                  .map((item) => (
                    <li key={`${item.displayOrder}-${item.outcome}`} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item.outcome}</span>
                    </li>
                  ))}
              </ul>
            </DetailSection>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <ApiErrorAlert error={selectionError} title="Etkinlik seçilemedi" />
            <SubmitButton
              type="button"
              pending={pending}
              pendingLabel="Etkinlik seçiliyor…"
              className="w-full sm:w-fit sm:px-6"
              disabled={isCompleted}
              onClick={handleSelect}
            >
              {isCompleted
                ? 'Etkinlik tamamlandı'
                : isSelected
                  ? 'Etkinlik detaylarını incele'
                  : 'Bu etkinliği seç'}
              {!isCompleted ? <ArrowRight data-icon="inline-end" /> : null}
            </SubmitButton>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isCompleted
                ? 'Bu etkinliği bugün tamamladın.'
                : isSelected
                  ? 'Seçtiğin etkinliğin hazırlık ve uygulama detaylarına devam edebilirsin.'
                  : 'Seçtikten sonra etkinlik için hazırlık ekranına geçeceksin.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
