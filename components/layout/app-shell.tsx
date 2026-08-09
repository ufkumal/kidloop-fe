'use client'

import Link from 'next/link'
import { CircleUserRound, LogOut } from 'lucide-react'
import { KidloopLogo } from '@/components/brand/kidloop-logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  /** Geniş içerik (yan panelli onboarding) için daha ferah genişlik. */
  width?: 'default' | 'wide'
}

export function AppShell({ children, width = 'default' }: AppShellProps) {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur-sm">
        <div
          className={cn(
            'mx-auto flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-8',
            width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
          )}
        >
          <KidloopLogo />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 px-3"
              nativeButton={false}
              render={<Link href="/profile" aria-label="Profili aç" />}
            >
              <CircleUserRound data-icon="inline-start" />
              <span className="hidden sm:inline">Profil</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-11 px-3"
              onClick={signOut}
            >
              <LogOut data-icon="inline-start" />
              <span className="hidden sm:inline">Çıkış yap</span>
              <span className="sr-only sm:hidden">Çıkış yap</span>
            </Button>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto flex w-full flex-1 flex-col px-5 py-8 sm:px-8 sm:py-12',
          width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
        )}
      >
        {children}
      </main>
    </div>
  )
}
