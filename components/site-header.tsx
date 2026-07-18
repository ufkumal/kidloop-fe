import { KidloopLogo } from '@/components/kidloop-logo'

type SiteHeaderProps = {
  parentName?: string
  parentInitial?: string
}

export function SiteHeader({ parentName = 'Selin', parentInitial = 'S' }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <KidloopLogo />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">{parentName}</p>
            <p className="text-xs leading-tight text-muted-foreground">Ebeveyn hesabı</p>
          </div>
          <div
            className="flex size-10 items-center justify-center rounded-full bg-pine-soft text-sm font-semibold text-pine"
            aria-hidden="true"
          >
            {parentInitial}
          </div>
        </div>
      </div>
    </header>
  )
}
