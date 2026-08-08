import { CalendarCheck, Clock, MapPin, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { LastActivitySummary } from '@/lib/types/home'
import { cn } from '@/lib/utils'

const TONE_CLASS: Record<LastActivitySummary['tone'], string> = {
  primary: 'bg-primary-soft text-primary',
  orange: 'bg-orange-soft text-orange',
  purple: 'bg-purple-soft text-purple',
}

/** PlanPreviewCard'ın kompakt "son etkinlik" varyantı. */
export function LastActivityCard({ activity }: { activity: LastActivitySummary }) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)]">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl',
            TONE_CLASS[activity.tone],
          )}
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
              <Clock className="size-4" aria-hidden="true" />
              {activity.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {activity.place}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="size-4" aria-hidden="true" />
              {activity.completedLabel}
            </span>
          </div>

          <Badge variant="secondary" className="w-fit rounded-full">
            {activity.skill}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
