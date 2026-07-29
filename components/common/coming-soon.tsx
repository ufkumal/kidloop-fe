'use client'

import { Clock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useAuth } from '@/lib/auth/auth-context'
import { ACTION_BUTTON_CLASS } from '@/lib/ui'

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = 'Bu alan yakında',
  description = 'Hesabın Kidloop’ta açıldı ancak bu rol için panel henüz hazır değil. Hazır olduğunda seni haberdar edeceğiz.',
}: ComingSoonProps) {
  const { signOut } = useAuth()

  return (
    <Empty className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-2xl bg-warm text-warm-foreground [&_svg:not([class*='size-'])]:size-5"
        >
          <Clock />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-xl">{title}</EmptyTitle>
        <EmptyDescription className="leading-relaxed">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={ACTION_BUTTON_CLASS}
          onClick={signOut}
        >
          <LogOut data-icon="inline-start" />
          Çıkış yap
        </Button>
      </EmptyContent>
    </Empty>
  )
}
