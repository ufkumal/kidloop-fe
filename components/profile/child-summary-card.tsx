'use client'

import Link from 'next/link'
import { CalendarDays, Pencil } from 'lucide-react'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ChildProfileSummary } from '@/lib/types/profile'

/** Seçili çocuğun özet kartı. "Profili düzenle" şimdilik yalnızca tasarımsal. */
export function ChildSummaryCard({ child }: { child: ChildProfileSummary }) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <ProfileAvatar name={child.name} src={child.avatarUrl} className="size-16 sm:size-18" />

          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-xl font-bold leading-snug">{child.name}</h2>
              {child.birthDateLabel ? (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {child.birthDateLabel}
                  {child.ageLabel ? ` · ${child.ageLabel}` : null}
                </span>
              ) : child.ageLabel ? (
                <span className="text-sm text-muted-foreground">{child.ageLabel}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Doğum tarihi eklenmedi</span>
              )}
            </div>

            {child.highlights.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {child.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Badge variant="secondary" className="h-auto rounded-full py-1 font-medium">
                      {highlight}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* Ayrı bir düzenleme ekranı yok; mevcut onboarding kimlik adımı kullanılır. */}
        <Button
          variant="secondary"
          size="sm"
          className="h-11 shrink-0 rounded-xl px-4"
          nativeButton={false}
          render={<Link href="/onboarding/identity" />}
        >
          <Pencil data-icon="inline-start" />
          Profili düzenle
        </Button>
      </CardContent>
    </Card>
  )
}
