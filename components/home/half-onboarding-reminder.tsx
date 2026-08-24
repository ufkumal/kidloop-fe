import Link from 'next/link'
import { ArrowRight, Clock3, Heart, Lightbulb, Sparkles, WandSparkles } from 'lucide-react'
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

const BENEFITS = [
  {
    icon: WandSparkles,
    title: 'Yeni etkinlikler',
    description: 'Yanıtlarından yola çıkarak çocuğuna uygun yeni etkinlik fikirleri hazırlayalım.',
    tone: 'bg-primary-soft text-primary',
  },
  {
    icon: Lightbulb,
    title: 'Size özel öneriler',
    description: 'Yaşına, ilgi alanlarına ve ihtiyaçlarına daha uygun öneriler keşfet.',
    tone: 'bg-orange-soft text-orange',
  },
  {
    icon: Clock3,
    title: 'Kaldığın yerden',
    description: 'Önceki yanıtların kayıtlı. Yalnızca kalan kısa adımları tamamlaman yeterli.',
    tone: 'bg-purple-soft text-purple',
  },
] as const

export function HalfOnboardingReminder({ status }: { status: HalfOnboardingStatus }) {
  const continuationPath = onboardingContinuationPath(status)

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-card sm:px-9 sm:py-11">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 hidden size-48 rounded-full bg-primary-soft/70 sm:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 hidden size-40 rounded-full bg-orange-soft/70 sm:block"
        />

        <div className="relative flex flex-col gap-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Sana özel etkinliklere az kaldı
          </span>

          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
              Soruları tamamla, {status.childName} için yeni etkinlikler üretelim.
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Birkaç kısa adım kaldı. Yanıtlarını tamamladığında {status.childName}&apos;in yaşına,
              ilgi alanlarına ve günlük ritminize uygun fikirler hazırlamaya başlayacağız.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 pt-1">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-7"
              render={<Link href={continuationPath} />}
            >
              Hadi, soruları tamamla
              <ArrowRight data-icon="inline-end" />
            </Button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Kaldığın yerden devam et • Sıradaki adım: {STEP_LABELS[status.onboardingStep]}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="after-onboarding" className="flex flex-col gap-5">
        <h2 id="after-onboarding" className="font-heading text-xl font-bold">
          Tamamlayınca seni neler bekliyor?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <Card className="h-full rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)]">
                <CardContent className="flex h-full flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-11 items-center justify-center rounded-2xl ${benefit.tone}`}
                  >
                    <benefit.icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-base font-bold leading-snug">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-warm/70 px-6 py-7 sm:px-8">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Heart className="size-5 text-orange" aria-hidden="true" />
          Cevapların güvende.
        </h2>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Daha önce verdiğin yanıtları kaydettik. Her şeyi yeniden doldurmana gerek yok; sadece
          kaldığın yerden devam edebilirsin.
        </p>
      </section>
    </div>
  )
}
