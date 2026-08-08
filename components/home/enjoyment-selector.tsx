'use client'

import { Check, Meh, Smile, ThumbsDown } from 'lucide-react'
import { ENJOYMENT_OPTIONS } from '@/lib/mock/home'
import type { EnjoymentLevel } from '@/lib/types/home'
import { cn } from '@/lib/utils'

const OPTION_ICON = {
  loved: Smile,
  somewhat: Meh,
  not_interested: ThumbsDown,
} as const

interface EnjoymentSelectorProps {
  value: EnjoymentLevel | null
  onChange: (value: EnjoymentLevel | null) => void
  disabled?: boolean
}

export function EnjoymentSelector({ value, onChange, disabled }: EnjoymentSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="text-sm font-semibold leading-relaxed text-foreground">
        Çocuğun etkinlikten keyif aldı mı?
      </legend>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {ENJOYMENT_OPTIONS.map((option) => {
          const Icon = OPTION_ICON[option.value]
          const selected = value === option.value
          const inputId = `enjoyment-${option.value}`

          return (
            <label
              key={option.value}
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
                name="enjoyment"
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
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
