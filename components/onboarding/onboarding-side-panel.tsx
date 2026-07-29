import { HelpCircle, Sparkles, UserRound } from 'lucide-react'
import { QuestionProgress } from '@/components/onboarding/question-progress'
import { Separator } from '@/components/ui/separator'

interface OnboardingSidePanelProps {
  childName?: string | null
  answeredCount: number
  totalQuestions: number
}

const REASONS = [
  'Çocuğunun yaşına ve ilgisine uygun etkinlikleri seçebilmek için.',
  'Evde mi, dışarıda mı vakit geçirmeyi sevdiğinizi anlamak için.',
  'Günlük planı ailenin ritmine göre kısa ve uygulanabilir tutmak için.',
]

export function OnboardingSidePanel({
  childName,
  answeredCount,
  totalQuestions,
}: OnboardingSidePanelProps) {
  return (
    <aside className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        >
          <UserRound className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Çocuğun
          </span>
          <span className="font-heading text-lg font-bold text-foreground">
            {childName?.trim() ? childName : 'Profil hazırlanıyor'}
          </span>
        </div>
      </div>

      <QuestionProgress
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        label="İlerleme"
      />

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold">
          <HelpCircle className="size-4 text-primary" aria-hidden="true" />
          Neden soruyoruz?
        </h2>
        <ul className="flex flex-col gap-2.5">
          {REASONS.map((reason) => (
            <li key={reason} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden="true" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
