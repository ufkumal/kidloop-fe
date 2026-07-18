import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type AnswerOptionProps = {
  letter: string
  title: string
  archetype: string
  selected: boolean
  onSelect: () => void
}

export function AnswerOption({ letter, title, archetype, selected, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group flex w-full items-start gap-4 rounded-2xl border-2 bg-surface p-4 text-left transition-all duration-200 outline-none sm:p-5',
        'focus-visible:ring-3 focus-visible:ring-pine/30',
        selected
          ? 'border-pine bg-pine-soft'
          : 'border-border hover:border-pine/40 hover:bg-pine-soft/40',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors',
          selected
            ? 'bg-pine text-pine-foreground'
            : 'bg-secondary text-muted-foreground group-hover:bg-pine/10 group-hover:text-pine',
        )}
        aria-hidden="true"
      >
        {letter}
      </span>

      <span className="flex-1 pt-0.5">
        <span className="block font-medium leading-snug text-ink">{title}</span>
        <span
          className={cn(
            'mt-1 block text-sm transition-colors',
            selected ? 'text-pine' : 'text-muted-foreground',
          )}
        >
          {archetype}
        </span>
      </span>

      <span
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          selected ? 'border-pine bg-pine text-pine-foreground' : 'border-border bg-transparent',
        )}
        aria-hidden="true"
      >
        <Check
          className={cn('size-3.5 transition-opacity', selected ? 'opacity-100' : 'opacity-0')}
        />
      </span>
    </button>
  )
}
