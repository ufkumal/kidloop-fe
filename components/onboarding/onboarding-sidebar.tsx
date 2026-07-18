import { Compass, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import type { Child } from '@/lib/onboarding-types'

type OnboardingSidebarProps = {
  child: Child
  answeredCount: number
  totalQuestions: number
}

export function OnboardingSidebar({
  child,
  answeredCount,
  totalQuestions,
}: OnboardingSidebarProps) {
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  return (
    <aside className="flex flex-col gap-5">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-pine-soft px-3 py-1 text-xs font-semibold text-pine">
          <Sparkles className="size-3.5" />
          Tanışma adımı
        </span>
        <h1 className="mt-4 text-pretty font-heading text-3xl font-extrabold leading-tight text-ink">
          {child.name}&apos;i biraz daha yakından tanıyalım
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Birkaç kısa soru, {child.name} için doğru zorlukta ve gerçekten keyif alacağı
          aktiviteler önermemize yardımcı oluyor. Doğru ya da yanlış cevap yok — sadece onu
          tanımaya çalışıyoruz.
        </p>
      </div>

      {/* Child info card */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <div
            className="flex size-14 items-center justify-center rounded-2xl bg-apricot-soft text-lg font-bold text-apricot"
            aria-hidden="true"
          >
            {child.initial}
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-ink">{child.name}</p>
            <p className="text-sm text-muted-foreground">{child.ageLabel}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">İlerleme</span>
            <span className="text-muted-foreground">
              {answeredCount}/{totalQuestions} soru
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-valuenow={answeredCount}
            aria-label="Soru ilerlemesi"
          >
            <div
              className="h-full rounded-full bg-pine transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Why we ask */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-heading text-base font-bold text-ink">Neden soruyoruz?</h2>
        <ul className="mt-4 flex flex-col gap-4">
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine">
              <Compass className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {child.name}&apos;in mizacını anlayıp ona uygun aktiviteler seçiyoruz.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-apricot-soft text-apricot">
              <Heart className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Güçlü yanlarını pekiştirip yeni alanları doğru tempoda keşfettiriyoruz.
            </p>
          </li>
        </ul>
      </div>

      {/* Privacy reassurance */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-lilac-soft/60 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lilac" />
        <p className="text-sm leading-relaxed text-ink/80">
          Verdiğin yanıtlar yalnızca {child.name}&apos;e özel öneriler üretmek için kullanılır.
          Dilediğin an düzenleyebilir veya silebilirsin.
        </p>
      </div>
    </aside>
  )
}
