import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  label?: string
  /** 'skeleton' form iskeleti, 'spinner' kısa beklemeler için */
  variant?: 'skeleton' | 'spinner'
  className?: string
}

export function LoadingState({
  label = 'Yükleniyor…',
  variant = 'skeleton',
  className,
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex items-center justify-center gap-3 py-10 text-muted-foreground', className)}
      >
        <Spinner className="size-5" />
        <span className="text-sm">{label}</span>
      </div>
    )
  }

  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col gap-5', className)}>
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  )
}
