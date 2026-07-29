import { Sparkles } from 'lucide-react'

interface OnboardingWelcomeProps {
  title?: string
  description?: string
  eyebrow?: string
}

export function OnboardingWelcome({
  eyebrow = 'İlk adım',
  title = 'Seni ve çocuğunu tanımaya başlayalım',
  description = 'Birkaç kısa bilgiyle çocuğuna uygun etkinlik önerileri hazırlayacağız.',
}: OnboardingWelcomeProps) {
  return (
    <header className="flex flex-col gap-3">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {eyebrow}
      </span>
      <h1 className="text-balance text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">{description}</p>
    </header>
  )
}
