'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MessageCircleHeart, Sparkles } from 'lucide-react'
import { ActivityFeedbackCard } from '@/components/home/activity-feedback-card'
import { LastActivityCard } from '@/components/home/last-activity-card'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'
import type { FeedbackQuestion, HomeStatus } from '@/lib/types/home'

type ReturningStatus = Extract<HomeStatus, { state: 'feedback-required' | 'returning-user' }>

const FEEDBACK_LABELS = {
  LIKED: 'Beğendi',
  STRUGGLED: 'Zorlandı',
  DISLIKED: 'Beğenmedi',
} as const

interface ReturningUserWelcomeProps {
  status: ReturningStatus
  questions: FeedbackQuestion[]
  onFeedbackSubmitted: () => void
}

export function ReturningUserWelcome({
  status,
  questions,
  onFeedbackSubmitted,
}: ReturningUserWelcomeProps) {
  const router = useRouter()
  const { setActiveChild } = useAuth()
  const [navigating, setNavigating] = useState(false)
  function handleGeneratePlan() {
    if (navigating || !status.shouldGenerateDailyPlan) return
    setNavigating(true)
    setActiveChild({ childId: String(status.childId), childName: status.childName })
    router.push('/plan-ready')
  }

  if (status.state === 'feedback-required') {
    const activity = status.latestActivity
    return (
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Tekrar hoş geldin
          </span>
          <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl">
            {status.childName} etkinliği nasıl buldu?
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Paylaştıkların, sonraki önerileri size daha uygun hale getirmemize yardımcı olacak.
          </p>
        </header>

        <LastActivityCard activity={activity} />

        <section
          id="feedback"
          aria-labelledby="feedback-heading"
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <h2 id="feedback-heading" className="font-heading text-xl font-bold">
            Geri bildirimin
          </h2>
          <ActivityFeedbackCard
            activity={activity}
            childId={status.childId}
            questions={questions}
            onSubmitted={onFeedbackSubmitted}
          />
        </section>
      </div>
    )
  }

  const activity = status.latestActivity
  const previousFeedback = activity?.feedback
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Bugün ne oynasak?
        </span>
        <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl">
          {status.childName} ile yeni bir etkinliğe hazır mısınız?
        </h1>
      </header>

      {activity ? <LastActivityCard activity={activity} completed /> : null}

      {previousFeedback ? (
        <section aria-labelledby="previous-feedback-heading" className="flex flex-col gap-4">
          <h2 id="previous-feedback-heading" className="font-heading text-xl font-bold">
            Önceki geri bildirimin
          </h2>
          <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)]">
            <CardContent className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-purple-soft text-purple">
                <MessageCircleHeart className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <p className="font-heading font-bold">
                  {FEEDBACK_LABELS[previousFeedback.feedbackType]}
                </p>
                {previousFeedback.freeText ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    “{previousFeedback.freeText}”
                  </p>
                ) : null}
                {previousFeedback.resolvedReason ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {previousFeedback.resolvedReason}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h2 className="font-heading text-xl font-bold">Bugünün oyununu keşfet</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {status.shouldGenerateDailyPlan
            ? 'Günlük planını aç, size uygun öneriler arasından bir etkinlik seç.'
            : 'Bugün için yeni bir plan hazırlama zamanı henüz gelmedi.'}
        </p>
        <SubmitButton
          type="button"
          pending={navigating}
          pendingLabel="Plan açılıyor…"
          disabled={!status.shouldGenerateDailyPlan}
          onClick={handleGeneratePlan}
          className="mt-1 w-full sm:w-fit sm:px-6"
        >
          Bugün için aktivite öner
          <ArrowRight data-icon="inline-end" />
        </SubmitButton>
      </section>
    </div>
  )
}
