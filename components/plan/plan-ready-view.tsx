'use client'

import Link from 'next/link'
import { CalendarCheck, Sparkles } from 'lucide-react'
import { PlanPreviewCard } from '@/components/plan/plan-preview-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { SAMPLE_ACTIVITIES } from '@/lib/mock/sample-activities'

function todayLabel() {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

export function PlanReadyView() {
  const { activeChild } = useAuth()
  const childName = activeChild?.childName?.trim()

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <CalendarCheck className="size-3.5" aria-hidden="true" />
          {todayLabel()}
        </span>
        <h1 className="text-balance text-3xl font-bold sm:text-4xl">Bugünün planı hazır.</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {childName
            ? `${childName} için bugün denemenizi önerdiğimiz üç kısa etkinlik aşağıda.`
            : 'Çocuğunla bugün denemeniz için üç kısa etkinlik seçtik.'}
        </p>
      </header>

      <section aria-labelledby="plan-activities" className="flex flex-col gap-5">
        <h2 id="plan-activities" className="font-heading text-xl font-bold">
          Örnek etkinlikler
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_ACTIVITIES.map((activity) => (
            <PlanPreviewCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-border border-dashed bg-card/60 px-6 py-7">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Sparkles className="size-5 text-orange" aria-hidden="true" />
          Kişiselleştirilmiş planın çok yakında burada olacak.
        </h2>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Yukarıdaki etkinlikler örnek içeriktir. Öneri motoru hazır olduğunda bu alan çocuğunun
          yaşına, ilgi alanlarına ve gününüzün akışına göre otomatik olarak dolacak.
        </p>
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="h-11 w-full rounded-xl sm:w-fit"
          render={<Link href="/onboarding/identity" />}
        >
          Onboarding&apos;e dön
        </Button>
      </section>
    </div>
  )
}
