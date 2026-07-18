import Link from 'next/link'
import { ArrowLeft, Clock, Sparkles, Users } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { MOCK_CHILD } from '@/lib/onboarding-data'

type TodayPageProps = {
  params: Promise<{ childId: string }>
}

type PlanSlot = {
  label: string
  accent: 'pine' | 'apricot' | 'lilac'
  title: string
  description: string
  duration: string
  mode: string
}

const PLAN: PlanSlot[] = [
  {
    label: 'Güçlendirme',
    accent: 'pine',
    title: 'Yastık dağı tırmanışı',
    description: 'Sevdiği alanda garantili keyif — beden koordinasyonu güçleniyor.',
    duration: '10 dk',
    mode: 'birlikte · ev malzemesi',
  },
  {
    label: 'Gelişim',
    accent: 'apricot',
    title: 'Tünel–parkur oyunu',
    description: '18 ayın gelişim penceresi: kaba motor. Tam dönemin işi.',
    duration: '15 dk',
    mode: 'birlikte',
  },
  {
    label: 'Keşif',
    accent: 'lilac',
    title: 'Tencere-davul ritmi',
    description: 'Yeni bir alan deniyoruz — Deniz\'in müzikle arası nasıl?',
    duration: '5 dk',
    mode: 'gözetimli',
  },
]

const ACCENT_CLASSES: Record<PlanSlot['accent'], { chip: string; bar: string }> = {
  pine: { chip: 'bg-pine-soft text-pine', bar: 'bg-pine' },
  apricot: { chip: 'bg-apricot-soft text-apricot', bar: 'bg-apricot' },
  lilac: { chip: 'bg-lilac-soft text-lilac', bar: 'bg-lilac' },
}

export default async function TodayPage({ params }: TodayPageProps) {
  const { childId } = await params
  const child = MOCK_CHILD

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1024px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          href={`/onboarding/children/${childId}/questions`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Tanışma adımına dön
        </Link>

        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-pine-soft px-3 py-1 text-xs font-semibold text-pine">
            <Sparkles className="size-3.5" />
            Bugünün planı hazır
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-ink">
            Günaydın Selin
          </h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {child.name} · {child.ageLabel} için bugünün planını hazırladık.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLAN.map((slot) => {
            const accent = ACCENT_CLASSES[slot.accent]
            return (
              <article
                key={slot.title}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface"
              >
                <span className={`h-1.5 w-full ${accent.bar}`} aria-hidden="true" />
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${accent.chip}`}
                  >
                    {slot.label}
                  </span>
                  <h2 className="mt-3 font-heading text-lg font-bold text-ink">{slot.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {slot.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {slot.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {slot.mode}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface/60 p-4 text-center text-sm text-muted-foreground">
          Bu ekran, tanışma akışının ardından açılan örnek plan sayfasıdır.
        </p>
      </main>
    </div>
  )
}
