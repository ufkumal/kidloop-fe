'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Pencil } from 'lucide-react'
import { DynamicQuestionRenderer } from '@/components/onboarding/dynamic-question-renderer'
import { OnboardingSidePanel } from '@/components/onboarding/onboarding-side-panel'
import { QuestionProgress } from '@/components/onboarding/question-progress'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchCurrentQuestionnaire, submitAnswer } from '@/lib/api/onboarding'
import { useAuth } from '@/lib/auth/auth-context'
import type { NormalizedQuestion, QuestionnaireState } from '@/lib/types/onboarding'

/** Gösterilecek soruyu nextQuestionCode üzerinden, yoksa ilk yanıtsız sorudan seçer. */
function resolveCurrentQuestion(
  state: QuestionnaireState | null,
  editQuestionCode: string | null,
): NormalizedQuestion | null {
  if (!state) return null

  if (editQuestionCode) {
    const questionToEdit = state.questions.find((question) => question.code === editQuestionCode)
    if (questionToEdit) return questionToEdit
  }

  if (state.nextQuestionCode) {
    const matched = state.questions.find((question) => question.code === state.nextQuestionCode)
    if (matched) return matched
  }

  return (
    state.questions.find(
      (question) =>
        question.required && !question.answeredOptionCode && !question.answeredValue,
    ) ??
    null
  )
}

export function QuestionnaireFlow({
  childId,
  editQuestionCode = null,
}: {
  childId: string
  editQuestionCode?: string | null
}) {
  const router = useRouter()
  const { activeChild, setActiveChild } = useAuth()

  const [state, setState] = useState<QuestionnaireState | null>(null)
  const [value, setValue] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const completePath = `/onboarding/${encodeURIComponent(childId)}/complete`

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

  const currentQuestion = useMemo(
    () => resolveCurrentQuestion(state, editQuestionCode),
    [state, editQuestionCode],
  )
  const isEditing = Boolean(
    editQuestionCode && state?.questions.some((question) => question.code === editQuestionCode),
  )

  // Mevcut cevap varsa alanı önceden doldur (answeredOptionCode'a saygı).
  useEffect(() => {
    setValue(currentQuestion?.answeredOptionCode ?? currentQuestion?.answeredValue ?? '')
    setFieldError(null)
  }, [currentQuestion])

  // Çocuk adı API'den geldiğinde yerel özet güncellenir.
  const childName = state?.childName ?? activeChild?.childName ?? null
  useEffect(() => {
    if (state?.childName && state.childName !== activeChild?.childName) {
      setActiveChild({ childId, childName: state.childName })
    }
  }, [state?.childName, activeChild?.childName, childId, setActiveChild])

  /**
   * Yanıtsız soru kalmaması tek başına "tamamlandı" demek değildir: sunucu boş
   * ya da okunamayan bir liste döndüğünde de aynı duruma düşülür. Bu yüzden
   * yalnızca gerçek tamamlanma kanıtı varsa yönlendirme yapılır.
   */
  const allRequiredAnswered = Boolean(
    state &&
      state.questions.length > 0 &&
      state.questions
        .filter((question) => question.required)
        .every((question) => question.answeredOptionCode || question.answeredValue),
  )
  const isComplete = Boolean(
    state &&
      !currentQuestion &&
      (state.completed || (state.nextQuestionCode === null && allRequiredAnswered)),
  )

  // Sorular yüklendi ama gösterilecek/ tamamlanmış hiçbir şey yok: veri sorunu.
  const hasEmptyQuestionnaire = Boolean(state && !currentQuestion && !isComplete)

  useEffect(() => {
    if (!loading && isComplete) {
      router.replace(completePath)
    }
  }, [loading, isComplete, router, completePath])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentQuestion) return

    setSubmitError(null)

    if (!value.trim()) {
      setFieldError('Devam etmek için bir seçim yapman gerekiyor.')
      return
    }
    setFieldError(null)

    setPending(true)
    try {
      // Yanıt sonrası dönen güncel durum yerel veriyi tamamen değiştirir.
      const updated = await submitAnswer(childId, currentQuestion.code, value.trim())
      setState(updated)
      if (isEditing) {
        router.push(completePath)
      }
    } catch (cause) {
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  const answeredCount = state?.answeredCount ?? 0
  const totalQuestions = state?.totalQuestions ?? 0

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">
            {isEditing ? 'Cevabını düzenle' : 'Çocuğunu tanıyalım'}
          </span>
          <h1 className="text-balance text-2xl font-bold sm:text-3xl">
            {isEditing
              ? 'Seçimini güncelle ve cevaplarına geri dön'
              : 'Birkaç kısa soruyla önerileri kişiselleştirelim'}
          </h1>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-fit"
              nativeButton={false}
              render={
                <Link
                  href={`/onboarding/${encodeURIComponent(childId)}/identity?returnTo=${encodeURIComponent(`/onboarding/${childId}/questions`)}`}
                />
              }
            >
              <Pencil data-icon="inline-start" />
              Çocuk bilgilerini düzenle
            </Button>
          ) : null}
        </header>

        <QuestionProgress
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          className="lg:hidden"
        />

        <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
          <CardContent className="flex flex-col gap-6">
            {loading ? (
              <LoadingState label="Sorular yükleniyor…" />
            ) : loadError ? (
              <ApiErrorAlert error={loadError} title="Sorular yüklenemedi" onRetry={retry} />
            ) : hasEmptyQuestionnaire ? (
              <ApiErrorAlert
                error="Şu anda gösterilecek soru bulunamadı. Kısa süre sonra tekrar dene."
                title="Sorular hazır değil"
                onRetry={retry}
              />
            ) : !currentQuestion ? (
              <LoadingState label="Cevap özeti açılıyor…" variant="spinner" />
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
                <DynamicQuestionRenderer
                  question={currentQuestion}
                  value={value}
                  onChange={setValue}
                  error={fieldError}
                  disabled={pending}
                  emphasis
                />

                <ApiErrorAlert error={submitError} title="Cevap kaydedilemedi" />

                <SubmitButton pending={pending} pendingLabel="Kaydediliyor…">
                  {isEditing ? 'Değişikliği kaydet' : 'Devam et'}
                  <ArrowRight data-icon="inline-end" />
                </SubmitButton>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:block">
        <OnboardingSidePanel
          childName={childName}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />
      </div>
    </div>
  )
}
