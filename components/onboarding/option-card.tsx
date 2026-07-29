'use client'

import { RadioGroupItem } from '@/components/ui/radio-group'
import type { QuestionOption } from '@/lib/types/onboarding'

interface OptionCardProps {
  option: QuestionOption
  name: string
  disabled?: boolean
}

/**
 * Seçilebilir cevap kartı. RadioGroup içinde kullanılır; tüm kart
 * etiket olduğu için klavye ve dokunma hedefi geniş kalır.
 */
export function OptionCard({ option, name, disabled }: OptionCardProps) {
  const itemId = `${name}-${option.code}`

  return (
    <label
      htmlFor={itemId}
      className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 hover:bg-primary-soft/40 has-data-checked:border-primary has-data-checked:bg-primary-soft has-focus-visible:border-primary has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:p-5"
    >
      <RadioGroupItem id={itemId} value={option.code} disabled={disabled} className="mt-0.5" />
      <span className="flex flex-col gap-1">
        <span className="font-medium leading-snug text-foreground">{option.label}</span>
        {option.description ? (
          <span className="text-sm leading-relaxed text-muted-foreground">
            {option.description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
