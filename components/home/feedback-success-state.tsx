import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeedbackSuccessStateProps {
  childName?: string | null
  onStay: () => void
}

export function FeedbackSuccessState({ childName, onStay }: FeedbackSuccessStateProps) {
  return (
    <div className="flex flex-col items-start gap-4" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary"
      >
        <CircleCheck className="size-6" />
      </span>

      <h2 className="font-heading text-xl font-bold leading-snug">Paylaştığın için teşekkürler.</h2>

      <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
        {childName
          ? `Bu geri bildirim, ${childName} için hazırlayacağımız sonraki önerilere yardımcı olacak.`
          : 'Bu geri bildirim, sonraki önerilerinizi daha uygun hale getirmemize yardımcı olacak.'}
      </p>

      <div className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row">
        <Button
          size="lg"
          nativeButton={false}
          className="h-11 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-5"
          render={<Link href="/plan-ready" />}
        >
          Bugünün etkinliklerine göz at
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          onClick={onStay}
          className="h-11 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-4"
        >
          Ana sayfada kal
        </Button>
      </div>
    </div>
  )
}
