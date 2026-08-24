'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { ChildSummaryCard } from '@/components/profile/child-summary-card'
import { ChildSwitcher } from '@/components/profile/child-switcher'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { OnboardingAnswersCard } from '@/components/profile/onboarding-answers-card'
import { SuggestedActivityCard } from '@/components/profile/suggested-activity-card'
import { Button } from '@/components/ui/button'
import { fetchActivityHistory } from '@/lib/api/profile'
import { useAuth } from '@/lib/auth/auth-context'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { ChildProfile, SuggestedActivity } from '@/lib/types/profile'

interface ActivityListProps {
  id: string
  title: string
  description: string
  emptyTitle: string
  emptyDescription: string
  activities: SuggestedActivity[]
}

function ActivityList({
  id,
  title,
  description,
  emptyTitle,
  emptyDescription,
  activities,
}: ActivityListProps) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-heading text-lg font-bold">{title}</h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {activities.length === 0 ? (
        <Empty className="border border-dashed border-input bg-card py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-primary-soft text-primary">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-base font-bold">{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {activities.map((activity) => (
            <li key={activity.id} className="flex">
              <SuggestedActivityCard activity={activity} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Tek veya çok çocuklu ebeveyn durumlarını aynı düzenle karşılar. */
export function ChildProfileTab({ childProfiles }: { childProfiles: ChildProfile[] }) {
  const { setActiveChild } = useAuth()
  const [activeChildId, setActiveChildId] = useState(
    childProfiles[0]?.summary.childId ?? '',
  )
  const [activities, setActivities] = useState<SuggestedActivity[] | null>(null)
  const [activitiesError, setActivitiesError] = useState<unknown>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  const activeProfile =
    childProfiles.find((profile) => profile.summary.childId === activeChildId) ?? childProfiles[0]

  useEffect(() => {
    if (!activeProfile) return
    setActiveChild({
      childId: activeProfile.summary.childId,
      childName: activeProfile.summary.name,
      fullName: activeProfile.summary.name,
      displayName: activeProfile.summary.name,
      birthDate: activeProfile.summary.birthDate,
      gender: activeProfile.summary.gender,
    })
  }, [activeProfile, setActiveChild])

  const retryActivities = useCallback(() => {
    setActivitiesError(null)
    setActivities(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    if (!activeProfile) return
    const controller = new AbortController()
    setActivities(null)
    setActivitiesError(null)
    void fetchActivityHistory(activeProfile.summary.childId, controller.signal)
      .then(setActivities)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setActivitiesError(requestError)
      })
    return () => controller.abort()
  }, [activeProfile, requestVersion])

  const pendingActivities = useMemo(
    () => activities?.filter((activity) => activity.status === 'pending') ?? [],
    [activities],
  )
  const completedActivities = useMemo(
    () => activities?.filter((activity) => activity.status === 'completed') ?? [],
    [activities],
  )

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

  const { summary, onboardingAnswers } = activeProfile
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

      {activitiesError ? (
        <ApiErrorAlert
          error={activitiesError}
          title="Etkinlik geçmişi yüklenemedi"
          onRetry={retryActivities}
        />
      ) : activities === null ? (
        <LoadingState label="Etkinlik geçmişi yükleniyor…" />
      ) : (
        <>
          <ActivityList
            id="suggested-activities-heading"
            title="Daha önce önerilen etkinlikler"
            description={`${summary.name} için önerilen ve henüz tamamlanmayan etkinlikler.`}
            emptyTitle="Bekleyen öneri yok"
            emptyDescription={`${summary.name} için yeni bir plan hazırlandığında etkinlikler burada listelenecek.`}
            activities={pendingActivities}
          />
          <ActivityList
            id="completed-activities-heading"
            title="Tamamlanan etkinlikler"
            description={`${summary.name} ile tamamladığınız etkinliklerin geçmişi.`}
            emptyTitle="Henüz tamamlanan etkinlik yok"
            emptyDescription="Tamamladığınız etkinlikler burada birikmeye başlayacak."
            activities={completedActivities}
          />
        </>
      )}
    </div>
  )
}
