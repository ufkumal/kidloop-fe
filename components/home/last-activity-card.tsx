import { CalendarClock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { LatestActivity } from '@/lib/types/home'

function formatSelectedAt(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

/** PlanPreviewCard'ın kompakt "son etkinlik" varyantı. */
export function LastActivityCard({ activity }: { activity: LatestActivity }) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)]">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        >
          <Sparkles className="size-5" />
        </span>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Son etkinlik
            </span>
            <h3 className="font-heading text-lg font-bold leading-snug">{activity.title}</h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              {formatSelectedAt(activity.selectedAt)} tarihinde seçildi
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
