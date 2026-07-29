import { cn } from '@/lib/utils'

interface KidloopLogoProps {
  className?: string
  /** Koyu zemin üzerinde kullanıldığında true */
  inverted?: boolean
}

export function KidloopLogo({ className, inverted = false }: KidloopLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 items-center justify-center rounded-xl',
          inverted ? 'bg-card text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5">
          <path
            d="M9 12a3.2 3.2 0 1 1 3.2 3.2A3.2 3.2 0 0 1 9 12Zm0 0a3.2 3.2 0 1 0-3.2-3.2A3.2 3.2 0 0 0 9 12Zm6.2 3.2A3.2 3.2 0 1 0 18.4 12a3.2 3.2 0 0 0-3.2 3.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          'font-heading text-xl font-bold tracking-tight',
          inverted ? 'text-card' : 'text-foreground',
        )}
      >
        Kidloop
      </span>
    </span>
  )
}
