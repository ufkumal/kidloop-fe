import { Sparkles } from 'lucide-react'
import { ActivityFeedbackCard } from '@/components/home/activity-feedback-card'
import { LastActivityCard } from '@/components/home/last-activity-card'
import type { FeedbackQuestion, LatestActivity } from '@/lib/types/home'

interface ReturningUserWelcomeProps {
  activity: LatestActivity
  childId: number
  childName: string
  questions: FeedbackQuestion[]
}

export function ReturningUserWelcome({
  activity,
  childId,
  childName,
  questions,
}: ReturningUserWelcomeProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Tekrar hoş geldin
        </span>

        <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl">
          {childName
            ? `Merhaba! ${childName} etkinliği nasıl buldu?`
            : 'Merhaba! Son etkinliğiniz nasıl geçti?'}
        </h1>

        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Deneyiminizi birkaç cümleyle anlatın. Paylaştıkların, sonraki önerileri size daha uygun
          hale getirmemize yardımcı olacak.
        </p>
      </header>

      <LastActivityCard activity={activity} />

      <section aria-labelledby="feedback-heading" className="flex flex-col gap-4">
        <h2 id="feedback-heading" className="font-heading text-xl font-bold">
          Geri bildirimin
        </h2>
        <ActivityFeedbackCard
          activity={activity}
          childId={childId}
          childName={childName}
          questions={questions}
        />
      </section>
    </div>
  )
}
