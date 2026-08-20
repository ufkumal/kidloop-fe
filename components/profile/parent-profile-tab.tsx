'use client'

import { ConsentsCard } from '@/components/profile/consents-card'
import { PersonalInfoCard } from '@/components/profile/personal-info-card'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import { TimeBudgetCard } from '@/components/profile/time-budget-card'
import { Card, CardContent } from '@/components/ui/card'
import type { ParentProfile } from '@/lib/types/profile'

interface ParentProfileTabProps {
  parent: ParentProfile
}

export function ParentProfileTab({ parent }: ParentProfileTabProps) {
  const fullName = parent.fullName.trim()

  return (
    <div className="flex flex-col gap-7">
      <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
        <CardContent className="flex items-center gap-4">
          {/* Fotoğraf yükleme henüz yok; alan ileride upload için hazır. */}
          <ProfileAvatar
            name={fullName || 'Ebeveyn'}
            src={parent.avatarUrl}
            className="size-16"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="font-heading text-xl font-bold leading-snug">
              {fullName || 'Ebeveyn'}
            </h2>
            <p className="text-sm text-muted-foreground">Ebeveyn hesabı</p>
          </div>
        </CardContent>
      </Card>

      <PersonalInfoCard parent={parent} />
      <TimeBudgetCard />
      <ConsentsCard />
    </div>
  )
}
