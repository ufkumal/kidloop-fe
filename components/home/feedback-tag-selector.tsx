'use client'

import { Check, Plus } from 'lucide-react'
import type { FeedbackQuestion } from '@/lib/types/home'
import { cn } from '@/lib/utils'

interface FeedbackTagSelectorProps {
  question: FeedbackQuestion
  selected: string[]
  onToggle: (optionCode: string) => void
  disabled?: boolean
}

export function FeedbackTagSelector({
  question,
  selected,
  onToggle,
  disabled,
}: FeedbackTagSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="flex flex-col gap-1">
        <span className="text-sm font-semibold leading-relaxed text-foreground">
          {question.body}
          {question.required ? <span className="text-destructive"> *</span> : null}
        </span>
        {question.helperText ? (
          <span className="text-sm leading-relaxed text-muted-foreground">
            {question.helperText}
          </span>
        ) : null}
      </legend>

      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.code)

          return (
            <button
              key={option.code}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onToggle(option.code)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isSelected
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary-soft/40',
              )}
            >
              {isSelected ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Plus className="size-3.5 text-muted-foreground" aria-hidden="true" />
              )}
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
