import { CalendarCheck, Clock, Sparkles, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfileTone, SuggestedActivity } from '@/lib/types/profile'
import { cn } from '@/lib/utils'

const TONE_CLASS: Record<ProfileTone, string> = {
  primary: 'bg-primary-soft text-primary',
  orange: 'bg-orange-soft text-orange',
  purple: 'bg-purple-soft text-purple',
}

/** Ana sayfadaki etkinlik kartlarıyla aynı tasarım dilini kullanır. */
export function SuggestedActivityCard({ activity }: { activity: SuggestedActivity }) {
  return (
    <Card className="h-full rounded-3xl shadow-soft ring-border transition-shadow hover:shadow-card [--card-spacing:--spacing(5)]">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl',
              TONE_CLASS[activity.tone],
            )}
          >
            <Sparkles className="size-5" />
          </span>
          <Badge
            variant="secondary"
            className={cn(
              'h-auto rounded-full py-1 font-semibold',
              activity.status === 'completed'
                ? 'bg-primary-soft text-primary'
                : 'bg-warm text-warm-foreground',
            )}
          >
            {activity.status === 'completed' ? 'Tamamlandı' : 'Henüz yapılmadı'}
          </Badge>
        </div>

        <CardTitle className="font-heading text-lg font-bold leading-snug">
          {activity.title}
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          {activity.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <UsersRound className="size-4" aria-hidden="true" />
            {activity.involvement}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="size-4" aria-hidden="true" />
            {activity.suggestedAtLabel}
          </span>
        </div>

        <Badge variant="secondary" className="w-fit rounded-full">
          {activity.skill}
        </Badge>
      </CardContent>
    </Card>
  )
}
