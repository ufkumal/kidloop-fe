'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { ChildSummaryCard } from '@/components/profile/child-summary-card'
import { ChildSwitcher } from '@/components/profile/child-switcher'
import { OnboardingAnswersCard } from '@/components/profile/onboarding-answers-card'
import { SuggestedActivityCard } from '@/components/profile/suggested-activity-card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { ChildProfile } from '@/lib/types/profile'

/** Tek veya çok çocuklu ebeveyn durumlarını aynı düzenle karşılar. */
export function ChildProfileTab({ childProfiles }: { childProfiles: ChildProfile[] }) {
  const [activeChildId, setActiveChildId] = useState(
    childProfiles[0]?.summary.childId ?? '',
  )

  const activeProfile =
    childProfiles.find((profile) => profile.summary.childId === activeChildId) ?? childProfiles[0]

  if (!activeProfile) {
    return (
      <Empty className="border border-dashed border-input bg-card py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-primary-soft text-primary">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle className="font-heading text-base font-bold">
            Henüz çocuk profili yok
          </EmptyTitle>
          <EmptyDescription>
            İlk çocuk profilini oluşturduğunda etkinlik önerileri burada görünecek.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            className="h-11 rounded-xl px-4"
            nativeButton={false}
            render={<Link href="/onboarding/identity" />}
          >
            Çocuk ekle
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const { summary, onboardingAnswers, suggestedActivities } = activeProfile
  const questionsHref = `/onboarding/${encodeURIComponent(summary.childId)}/questions`

  return (
    <div className="flex flex-col gap-7">
      <ChildSwitcher
        items={childProfiles.map((profile) => profile.summary)}
        activeChildId={summary.childId}
        onSelect={setActiveChildId}
      />

      <ChildSummaryCard child={summary} />

      <OnboardingAnswersCard
        answers={onboardingAnswers}
        childName={summary.name}
        questionsHref={questionsHref}
      />

      <section aria-labelledby="suggested-activities-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="suggested-activities-heading" className="font-heading text-lg font-bold">
            Daha önce önerilen etkinlikler
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {summary.name} için hazırladığımız son öneriler ve durumları.
          </p>
        </div>

        {suggestedActivities.length === 0 ? (
          <Empty className="border border-dashed border-input bg-card py-10">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-11 rounded-2xl bg-primary-soft text-primary"
              >
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle className="font-heading text-base font-bold">
                Henüz öneri yok
              </EmptyTitle>
              <EmptyDescription>
                {summary.name} için ilk plan hazırlandığında etkinlikler burada listelenecek.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {suggestedActivities.map((activity) => (
              <li key={activity.id} className="flex">
                <SuggestedActivityCard activity={activity} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
