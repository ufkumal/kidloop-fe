'use client'

import { Check, Meh, Smile, ThumbsDown } from 'lucide-react'
import type { FeedbackQuestion } from '@/lib/types/home'
import { cn } from '@/lib/utils'

const OPTION_ICONS = [Smile, Meh, ThumbsDown] as const

interface EnjoymentSelectorProps {
  question: FeedbackQuestion
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function EnjoymentSelector({ question, value, onChange, disabled }: EnjoymentSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="text-sm font-semibold leading-relaxed text-foreground">
        {question.body}
        {question.required ? <span className="text-destructive"> *</span> : null}
      </legend>
      {question.helperText ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{question.helperText}</p>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-3">
        {question.options.map((option, index) => {
          const Icon = OPTION_ICONS[index] ?? Smile
          const selected = value === option.code
          const inputId = `${question.code}-${option.code}`

          return (
            <label
              key={option.code}
              htmlFor={inputId}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left shadow-soft transition-colors',
                'hover:border-primary/40 hover:bg-primary-soft/40',
                'has-focus-visible:border-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/40',
                'has-disabled:cursor-not-allowed has-disabled:opacity-60',
                selected ? 'border-primary bg-primary-soft' : 'border-border',
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={question.code}
                value={option.code}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.code)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                  selected ? 'bg-primary text-primary-foreground' : 'bg-warm text-warm-foreground',
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <span
                className={cn(
                  'flex-1 text-sm leading-snug',
                  selected ? 'font-semibold text-primary' : 'font-medium text-foreground',
                )}
              >
                {option.label}
              </span>
              {selected ? (
                <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
              ) : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
