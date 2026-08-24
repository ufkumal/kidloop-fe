'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DynamicQuestionRenderer } from '@/components/onboarding/dynamic-question-renderer'
import { OnboardingWelcome } from '@/components/onboarding/onboarding-welcome'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import {
  fetchIdentityQuestions,
  submitIdentityAnswers,
  updateChildIdentity,
} from '@/lib/api/onboarding'
import { useAuth } from '@/lib/auth/auth-context'
import type { StoredChild } from '@/lib/auth/storage'
import type { IdentityAnswers, NormalizedQuestion } from '@/lib/types/onboarding'

function identityField(question: NormalizedQuestion): 'fullName' | 'birthDate' | 'gender' | null {
  if (question.answerKey === 'fullName') return 'fullName'
  if (question.answerKey === 'birthDate' || question.type === 'DATE') return 'birthDate'
  if (question.answerKey === 'gender' || question.code === 'Q8') return 'gender'
  if (question.type === 'TEXT') return 'fullName'
  return null
}

function identityValueForQuestion(question: NormalizedQuestion, child: StoredChild | null): string {
  const field = identityField(question)
  if (field === 'fullName') return child?.fullName ?? child?.displayName ?? child?.childName ?? ''
  if (field === 'birthDate') return child?.birthDate ?? ''
  if (field === 'gender') return child?.gender ?? ''
  return question.answeredValue ?? question.answeredOptionCode ?? ''
}

function identityPayloadFromAnswers(answers: IdentityAnswers, questions: NormalizedQuestion[]) {
  const values: { fullName: string | null; birthDate: string; gender: string | null } = {
    fullName: null,
    birthDate: '',
    gender: null,
  }
  for (const question of questions) {
    const field = identityField(question)
    if (!field) continue
    const value = answers[question.code]?.trim() ?? ''
    if (field === 'birthDate') values.birthDate = value
    else values[field] = value || null
  }
  return values
}

function validateAnswer(question: NormalizedQuestion, value: string): string | null {
  const trimmed = value.trim()

  if (question.required && !trimmed) {
    return 'Bu alanı doldurman gerekiyor.'
  }
  if (!trimmed) return null

  if (question.type === 'DATE') {
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) return 'Geçerli bir tarih seç.'
    if (parsed.getTime() > Date.now()) return 'Doğum tarihi gelecekte olamaz.'
  }
  if (question.type === 'TEXT' && trimmed.length < 2) {
    return 'En az 2 karakter yaz.'
  }

  return null
}

export function IdentityForm({
  editChildId,
  returnTo = '/profile',
}: {
  editChildId?: string
  returnTo?: string
} = {}) {
  const router = useRouter()
  const { activeChild, resolveHomeStatus, setActiveChild } = useAuth()
  const isEditing = Boolean(editChildId)

  const [questions, setQuestions] = useState<NormalizedQuestion[]>([])
  const [childId, setChildId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<IdentityAnswers>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    // V2: parent'ın kayıtlı çocuğu varsa bu çağrı atlanıp onboarding
    // uygun adımdan devam edecek. Kontrol buraya eklenecek.
    fetchIdentityQuestions(controller.signal)
      .then((result) => {
        setQuestions(result.questions)
        setChildId(result.childId)
        setAnswers(
          Object.fromEntries(
            result.questions.map((question) => [
              question.code,
              isEditing
                ? identityValueForQuestion(question, activeChild)
                : (question.answeredValue ?? question.answeredOptionCode ?? ''),
            ]),
          ),
        )
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, isEditing, activeChild])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    const nextErrors: Record<string, string | null> = {}
    for (const question of questions) {
      nextErrors[question.code] = validateAnswer(question, answers[question.code] ?? '')
    }
    setFieldErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setPending(true)
    try {
      if (editChildId) {
        const identity = identityPayloadFromAnswers(answers, questions)
        const updated = await updateChildIdentity(editChildId, identity)
        setActiveChild({
          childId: updated.childId,
          childName: updated.displayName ?? updated.fullName,
          fullName: updated.fullName,
          displayName: updated.displayName,
          birthDate: updated.birthDate,
          ageMonths: updated.ageMonths,
          ageBand: updated.ageBand,
          gender: updated.gender,
        })
        if (updated.questionnaireRestarted) {
          const resolution = await resolveHomeStatus()
          router.replace(resolution.path)
        } else {
          router.push(returnTo)
        }
        return
      }
      const result = await submitIdentityAnswers({ childId, answers, questions })
      setActiveChild({ childId: result.childId, childName: result.childName })
      router.push(`/onboarding/${encodeURIComponent(result.childId)}/daily-time-budget`)
    } catch (cause) {
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {isEditing ? (
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-primary uppercase">
            Çocuk profili
          </span>
          <h1 className="text-balance text-2xl font-bold sm:text-3xl">Kimlik bilgilerini düzenle</h1>
          <p className="text-muted-foreground">
            Doğum tarihi yaş bandını değiştirirse uygun soruları yeniden yanıtlaman gerekir.
          </p>
        </header>
      ) : (
        <OnboardingWelcome />
      )}

      <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardContent className="flex flex-col gap-6">
          {loading ? (
            <LoadingState label="Sorular hazırlanıyor…" />
          ) : loadError ? (
            <ApiErrorAlert
              error={loadError}
              title="Sorular yüklenemedi"
              onRetry={retry}
            />
          ) : questions.length === 0 ? (
            <ApiErrorAlert
              error="Şu anda gösterilecek soru bulunamadı. Birazdan tekrar denemeyi dene."
              title="Soru bulunamadı"
              onRetry={retry}
            />
          ) : (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
              <FieldGroup>
                {questions.map((question) => (
                  <DynamicQuestionRenderer
                    key={question.code}
                    question={question}
                    value={answers[question.code] ?? ''}
                    onChange={(value) =>
                      setAnswers((current) => ({ ...current, [question.code]: value }))
                    }
                    error={fieldErrors[question.code]}
                    disabled={pending}
                  />
                ))}
              </FieldGroup>

              <ApiErrorAlert error={submitError} title="Bilgiler kaydedilemedi" />

                <SubmitButton pending={pending} pendingLabel="Kaydediliyor…">
                  {isEditing ? 'Değişiklikleri kaydet' : 'Devam et'}
              </SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Bilgileri yalnızca çocuğuna uygun etkinlik önerileri hazırlamak için kullanıyoruz.
      </p>
    </div>
  )
}
