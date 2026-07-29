import { Clock, MapPin, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SampleActivity } from '@/lib/mock/sample-activities'
import { cn } from '@/lib/utils'

const TONE_CLASS: Record<SampleActivity['tone'], string> = {
  primary: 'bg-primary-soft text-primary',
  orange: 'bg-orange-soft text-orange',
  purple: 'bg-purple-soft text-purple',
}

export function PlanPreviewCard({ activity }: { activity: SampleActivity }) {
  return (
    <Card className="h-full rounded-3xl shadow-soft ring-border transition-shadow hover:shadow-card">
      <CardHeader className="gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-11 items-center justify-center rounded-2xl',
            TONE_CLASS[activity.tone],
          )}
        >
          <Sparkles className="size-5" />
        </span>
        <CardTitle className="font-heading text-lg font-bold">{activity.title}</CardTitle>
        <CardDescription className="leading-relaxed">{activity.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {activity.place}
          </span>
        </div>
        <Badge variant="secondary" className="w-fit rounded-full">
          {activity.skill}
        </Badge>
      </CardContent>
    </Card>
  )
}
