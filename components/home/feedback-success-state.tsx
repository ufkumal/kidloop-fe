import { CircleCheck } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Button } from '@/components/ui/button'

interface FeedbackSuccessStateProps {
  childName?: string | null
  onBrowse: () => void
  browsePending: boolean
  browseError?: unknown
  onStay: () => void
}

export function FeedbackSuccessState({
  childName,
  onBrowse,
  browsePending,
  browseError,
  onStay,
}: FeedbackSuccessStateProps) {
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

      <ApiErrorAlert error={browseError} title="Günlük plan yüklenemedi" />

      <div className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row">
        <SubmitButton
          type="button"
          size="lg"
          pending={browsePending}
          pendingLabel="Etkinlikler yükleniyor…"
          onClick={onBrowse}
          className="h-11 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-5"
        >
          Bugünün etkinliklerine göz at
        </SubmitButton>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          disabled={browsePending}
          onClick={onStay}
          className="h-11 w-full rounded-xl text-[0.95rem] sm:w-fit sm:px-4"
        >
          Ana sayfada kal
        </Button>
      </div>
    </div>
  )
}
