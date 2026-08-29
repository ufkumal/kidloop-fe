import { CalendarClock, Clock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { LatestActivity } from '@/lib/types/home'

const SLOT_LABELS: Record<string, string> = {
  STRENGTHEN: 'Güçlendirme',
  DEVELOP: 'Gelişim',
  EXPLORE: 'Keşif',
}

function formatSelectedAt(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function LastActivityCard({
  activity,
  completed = false,
}: {
  activity: LatestActivity
  completed?: boolean
}) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          >
            <Sparkles className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {completed ? 'Daha önce tamamladığınız etkinlik' : 'Son seçilen etkinlik'}
              </span>
              <h3 className="font-heading text-xl font-bold leading-snug">{activity.title}</h3>
              {activity.description ? (
                <p className="mt-1 leading-relaxed text-muted-foreground">{activity.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {activity.durationMinutes} dakika
              </span>
              <Badge variant="secondary" className="rounded-full">
                {SLOT_LABELS[activity.slotType] ?? activity.slotType}
              </Badge>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden="true" />
                {formatSelectedAt(activity.selectedAt)} tarihinde seçildi
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
