import Link from 'next/link'
import { Heart, Lightbulb, MessageCircleHeart, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STEPS = [
  {
    icon: UserRound,
    title: 'Bize çocuğundan bahset',
    description: 'Yaşı, ilgi alanları ve günlük rutiniyle ilgili birkaç kısa soruyu yanıtla.',
    tone: 'bg-primary-soft text-primary',
  },
  {
    icon: Lightbulb,
    title: 'Size özel fikirler keşfet',
    description: 'Evinize, zamanınıza ve çocuğunun ihtiyaçlarına uygun etkinlik önerileri al.',
    tone: 'bg-orange-soft text-orange',
  },
  {
    icon: MessageCircleHeart,
    title: 'Deneyimini paylaş',
    description:
      'Nelerin iyi gittiğini anlatarak sonraki önerilerin daha da kişiselleşmesine yardımcı ol.',
    tone: 'bg-purple-soft text-purple',
  },
] as const

export function NewUserWelcome() {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-card sm:px-9 sm:py-11">
        {/* Sıcak dekoratif zemin — içeriği kalabalıklaştırmayan, yalın CSS şekilleri. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 hidden size-48 rounded-full bg-primary-soft/70 sm:block"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 hidden size-40 rounded-full bg-orange-soft/70 sm:block"
        />

        <div className="relative flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Kidloop&apos;a hoş geldin
          </span>

          <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight sm:text-4xl">
            Çocuğunla geçirdiğin zamanı birlikte güzelleştirelim.
          </h1>

          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Kidloop, çocuğunun yaşına, ilgi alanlarına ve günlük ritminize uygun etkinlik fikirleri
            hazırlar. Seni ve çocuğunu biraz tanıdıktan sonra size özel öneriler sunmaya
            başlayacağız.
          </p>

          <div className="flex flex-col gap-3 pt-1">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-7"
              render={<Link href="/onboarding/identity" />}
            >
              Çocuğumu tanıtmaya başla
            </Button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yalnızca birkaç kısa soru • Yaklaşık 3 dakika
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-kidloop-works" className="flex flex-col gap-5">
        <h2 id="how-kidloop-works" className="font-heading text-xl font-bold">
          Kidloop nasıl çalışır?
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((step) => (
            <li key={step.title}>
              <Card className="h-full rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)]">
                <CardContent className="flex h-full flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-11 items-center justify-center rounded-2xl ${step.tone}`}
                  >
                    <step.icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-base font-bold leading-snug">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-warm/70 px-6 py-7 sm:px-8">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
          <Heart className="size-5 text-orange" aria-hidden="true" />
          Her aile farklıdır.
        </h2>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Önerileri kendi temponuza göre değerlendirebilir, istediğin zaman değiştirebilir veya
          atlayabilirsin. Burada doğru ya da yanlış cevap yok.
        </p>
      </section>
    </div>
  )
}
