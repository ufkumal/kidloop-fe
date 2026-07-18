import { cn } from '@/lib/utils'

type KidloopLogoProps = {
  className?: string
}

export function KidloopLogo({ className }: KidloopLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="size-3 rounded-full bg-pine" />
        <span className="size-3 rounded-full bg-apricot" />
        <span className="size-3 rounded-full bg-lilac" />
      </span>
      <span className="font-heading text-xl font-extrabold tracking-tight text-ink">
        kidloop
      </span>
    </div>
  )
}
