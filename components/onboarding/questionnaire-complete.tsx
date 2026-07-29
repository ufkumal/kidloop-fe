'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, CircleCheck } from 'lucide-react'
import { QuestionProgress } from '@/components/onboarding/question-progress'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { completeQuestionnaire, fetchCurrentQuestionnaire } from '@/lib/api/onboarding'
import { ACTION_BUTTON_CLASS } from '@/lib/ui'
import type { NormalizedQuestion, QuestionnaireState } from '@/lib/types/onboarding'

function isAnswered(question: NormalizedQuestion) {
  return Boolean(question.answeredOptionCode ?? question.answeredValue)
}

export function QuestionnaireComplete({ childId }: { childId: string }) {
  const router = useRouter()

  const [state, setState] = useState<QuestionnaireState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const questionsPath = `/onboarding/${encodeURIComponent(childId)}/questions`

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    fetchCurrentQuestionnaire(childId, controller.signal)
      .then((next) => setState(next))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [childId, attempt])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  async function handleComplete() {
    setSubmitError(null)
    setPending(true)
    try {
      await completeQuestionnaire(childId)
      router.push('/plan-ready')
    } catch (cause) {
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-card ring-border">
        <CardContent>
          <LoadingState label="Cevapların derleniyor…" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return <ApiErrorAlert error={loadError} title="Özet yüklenemedi" onRetry={retry} />
  }

  const answered = (state?.questions ?? []).filter(isAnswered)
  const remaining = (state?.questions ?? []).filter((question) => !isAnswered(question))

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        >
          <CircleCheck className="size-6" />
        </span>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">Sorular tamamlandı</h1>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Cevaplarını gözden geçir. Onayladığında çocuğuna özel plan hazırlığını başlatacağız.
        </p>
      </header>

      <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="gap-4">
          <CardTitle className="font-heading text-lg font-bold">Yanıtladığın sorular</CardTitle>
          <QuestionProgress
            answeredCount={state?.answeredCount ?? answered.length}
            totalQuestions={state?.totalQuestions ?? answered.length}
            label="Tamamlanan"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {answered.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {answered.map((question) => (
                <li
                  key={question.code}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-warm/50 px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="size-3" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{question.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Henüz kayıtlı cevap görünmüyor.
            </p>
          )}

          {remaining.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-orange-soft px-4 py-4">
              <p className="text-sm leading-relaxed text-foreground">
                {remaining.length} soru hâlâ yanıtsız görünüyor. Planın daha isabetli olması için
                tamamlamanı öneririz.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => router.push(questionsPath)}
              >
                Sorulara dön
              </Button>
            </div>
          ) : null}

          <ApiErrorAlert error={submitError} title="Tamamlanamadı" />

          <SubmitButton
            type="button"
            pending={pending}
            pendingLabel="Planın hazırlanıyor…"
            onClick={handleComplete}
          >
            Planımı hazırla
            <ArrowRight data-icon="inline-end" />
          </SubmitButton>

          <Button
            type="button"
            variant="ghost"
            className={ACTION_BUTTON_CLASS}
            onClick={() => router.push(questionsPath)}
          >
            Cevaplarımı düzenle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
