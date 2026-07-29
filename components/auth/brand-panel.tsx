import Image from 'next/image'
import { Compass, HeartHandshake, Sparkles } from 'lucide-react'
import { KidloopLogo } from '@/components/brand/kidloop-logo'

const VALUES = [
  {
    icon: Sparkles,
    title: 'Çocuğuna göre öneriler',
    description: 'Yaşına ve ilgi alanlarına uygun, denemeye değer etkinlikler.',
  },
  {
    icon: Compass,
    title: 'Günlük küçük adımlar',
    description: 'Uzun listeler yok; her gün için sade ve uygulanabilir bir plan.',
  },
  {
    icon: HeartHandshake,
    title: 'Birlikte geçen zaman',
    description: 'Ekran yerine paylaşılan oyunlara alan açan öneriler.',
  },
]

export function BrandPanel() {
  return (
    <section
      aria-label="Kidloop hakkında"
      className="relative hidden overflow-hidden bg-primary-soft lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:p-12"
    >
      <div className="flex flex-col gap-8">
        <KidloopLogo />
        <div className="flex flex-col gap-4">
          <h1 className="max-w-md text-balance text-4xl font-bold leading-tight text-foreground">
            Çocuğunla geçirdiğin zamanı daha kolay planla.
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            Kidloop, çocuğunu tanıyarak ona uygun etkinlikleri seçer. Sen sadece ne zaman
            başlayacağına karar ver.
          </p>
        </div>
      </div>

      <div className="relative mx-auto aspect-4/3 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <Image
          src="/images/kidloop-brand-illustration.png"
          alt="Bir ebeveyn ve çocuğu birlikte ahşap bloklarla oynuyor"
          fill
          priority
          sizes="(min-width: 1024px) 28rem, 100vw"
          className="object-cover"
        />
      </div>

      <ul className="flex flex-col gap-5">
        {VALUES.map((value) => (
          <li key={value.title} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-soft"
            >
              <value.icon className="size-4.5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">{value.title}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
