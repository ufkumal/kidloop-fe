'use client'

import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react'
import { AnswerOption } from '@/components/onboarding/answer-option'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MIXED_OPTION_ID, type Child, type QuestionnaireQuestion } from '@/lib/onboarding-types'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

type QuestionCardProps = {
  child: Child
  question: QuestionnaireQuestion
  index: number
  total: number
  selectedOptionId: string | undefined
  onSelect: (optionId: string, isMixed: boolean) => void
  onPrevious: () => void
  onContinue: () => void
  isSaving: boolean
}

export function QuestionCard({
  child,
  question,
  index,
  total,
  selectedOptionId,
  onSelect,
  onPrevious,
  onContinue,
  isSaving,
}: QuestionCardProps) {
  const isFirst = index === 0
  const isLast = index === total - 1
  const hasAnswer = Boolean(selectedOptionId)

  return (
    <section
      aria-label={`Soru ${index + 1} / ${total}`}
      className="rounded-3xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(41,38,52,0.04),0_12px_32px_-16px_rgba(41,38,52,0.12)] sm:p-8"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {index + 1} / {total} · {child.name} için
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-6 bg-pine' : i < index ? 'w-1.5 bg-pine/50' : 'w-1.5 bg-border',
              )}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-pine">
        {child.name}&apos;i tanıyalım
      </p>

      {/* keyed wrapper drives the subtle enter transition on question change */}
      <div key={question.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
        <h2 className="mt-2 text-balance font-heading text-2xl font-bold leading-snug text-ink">
          {question.text}
        </h2>

        <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label={question.text}>
          {question.options.map((option, optionIndex) => (
            <AnswerOption
              key={option.id}
              letter={OPTION_LETTERS[optionIndex]}
              title={option.title}
              archetype={option.archetype}
              selected={selectedOptionId === option.id}
              onSelect={() => onSelect(option.id, false)}
            />
          ))}
        </div>

        {question.allowMixedAnswer ? (
          <button
            type="button"
            role="radio"
            aria-checked={selectedOptionId === MIXED_OPTION_ID}
            onClick={() => onSelect(MIXED_OPTION_ID, true)}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-transparent px-4 py-3.5 text-sm font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-lilac/30',
              selectedOptionId === MIXED_OPTION_ID
                ? 'border-lilac bg-lilac-soft text-lilac'
                : 'border-border text-muted-foreground hover:border-lilac/50 hover:text-lilac',
            )}
          >
            <Shuffle className="size-4" />
            Duruma göre çok değişir
          </button>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirst || isSaving}
          className="h-12 rounded-xl px-5 text-base text-muted-foreground hover:text-ink disabled:opacity-0 sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          Geri
        </Button>

        <Button
          onClick={onContinue}
          disabled={!hasAnswer || isSaving}
          className="h-12 w-full rounded-xl bg-pine px-6 text-base font-semibold text-pine-foreground hover:bg-pine/90 sm:w-auto"
        >
          {isSaving ? 'Kaydediliyor…' : isLast ? 'Tamamla' : 'Devam et'}
          {!isSaving ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
    </section>
  )
}
