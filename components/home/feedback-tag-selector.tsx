'use client'

import { Check, Plus } from 'lucide-react'
import { FEEDBACK_TAGS } from '@/lib/mock/home'
import { cn } from '@/lib/utils'

interface FeedbackTagSelectorProps {
  selected: string[]
  onToggle: (tag: string) => void
  disabled?: boolean
}

export function FeedbackTagSelector({ selected, onToggle, disabled }: FeedbackTagSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="flex flex-col gap-1">
        <span className="text-sm font-semibold leading-relaxed text-foreground">Nasıl geçti?</span>
        <span className="text-sm leading-relaxed text-muted-foreground">
          İstediğin kadar seçebilirsin, zorunlu değil.
        </span>
      </legend>

      <div className="flex flex-wrap gap-2">
        {FEEDBACK_TAGS.map((tag) => {
          const isSelected = selected.includes(tag)

          return (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
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
              {tag}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
