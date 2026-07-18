'use client'

import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Child, QuestionnaireQuestion } from '@/lib/onboarding-types'

type CompletionCardProps = {
  child: Child
  questions: QuestionnaireQuestion[]
  answeredCount: number
  isCalculating: boolean
  onCreatePlan: () => void
  onReview: () => void
}

export function CompletionCard({
  child,
  questions,
  answeredCount,
  isCalculating,
  onCreatePlan,
  onReview,
}: CompletionCardProps) {
  return (
    <section
      aria-label="Tanışma tamamlandı"
      className="rounded-3xl border border-border bg-surface p-6 text-center shadow-[0_1px_2px_rgba(41,38,52,0.04),0_12px_32px_-16px_rgba(41,38,52,0.12)] sm:p-10"
    >
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-pine-soft">
        <PartyPopper className="size-9 text-pine" />
      </div>

      <h2 className="mt-6 text-balance font-heading text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
        {child.name}&apos;i biraz daha yakından tanıdık
      </h2>
      <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
        Yanıtlarını kaydettik. Bu bilgiler {child.name}&apos;e uygun aktiviteler önermemize
        yardımcı olacak.
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-background/60 p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Tamamlanan yanıtlar</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-soft px-2.5 py-1 text-xs font-semibold text-pine">
            <CheckCircle2 className="size-3.5" />
            {answeredCount}/{questions.length}
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {questions.map((question, i) => (
            <li key={question.id} className="flex items-center gap-3">
              <CheckCircle2 className="size-4 shrink-0 text-pine" />
              <span className="truncate text-sm text-muted-foreground">
                {i + 1}. {question.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={onCreatePlan}
          disabled={isCalculating}
          className="h-12 rounded-xl bg-pine px-6 text-base font-semibold text-pine-foreground hover:bg-pine/90"
        >
          {isCalculating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Plan hazırlanıyor…
            </>
          ) : (
            `${child.name}'in planını oluştur`
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onReview}
          disabled={isCalculating}
          className="h-12 rounded-xl border-border px-6 text-base font-medium text-ink"
        >
          Yanıtları gözden geçir
        </Button>
      </div>
    </section>
  )
}
