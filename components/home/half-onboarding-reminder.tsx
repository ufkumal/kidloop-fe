import Link from 'next/link'
import { ArrowRight, ClipboardList, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { onboardingContinuationPath } from '@/lib/app/bootstrap'
import type { HomeStatus } from '@/lib/types/home'

type HalfOnboardingStatus = Extract<HomeStatus, { state: 'half-onboarding-user' }>

const STEP_LABELS = {
  DAILY_TIME_BUDGET: 'günlük zaman tercihi',
  QUESTIONNAIRE: 'tanıma soruları',
  CONSENTS: 'izinler',
} as const

export function HalfOnboardingReminder({ status }: { status: HalfOnboardingStatus }) {
  const continuationPath = onboardingContinuationPath(status)

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-card sm:px-9 sm:py-11">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 hidden size-48 rounded-full bg-primary-soft/70 sm:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 hidden size-40 rounded-full bg-orange-soft/70 sm:block"
        />

        <div className="relative flex flex-col items-start gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Kaldığın yer hazır
          </span>

          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-orange-soft text-orange"
          >
            <ClipboardList className="size-6" />
          </span>

          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
              {status.childName} için başladığın tanıma süreci henüz tamamlanmadı.
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Çocuğuna uygun ve güvenli etkinlikler önerebilmemiz için bu bilgilere ihtiyacımız
              var. Süreci yeniden başlatmadan, bıraktığın yerden devam edebilirsin.
            </p>
            <p className="text-sm font-medium text-foreground">
              Sıradaki adım: {STEP_LABELS[status.onboardingStep]}
            </p>
          </div>

          <Button
            size="lg"
            nativeButton={false}
            className="h-12 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-7"
            render={<Link href={continuationPath} />}
          >
            Kaldığım yerden devam et
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </div>
  )
}
