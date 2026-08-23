'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { EnjoymentSelector } from '@/components/home/enjoyment-selector'
import { FeedbackSuccessState } from '@/components/home/feedback-success-state'
import { VoiceFeedbackRecorder } from '@/components/home/voice-feedback-recorder'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { fetchTodayDailyPlan } from '@/lib/api/daily-plan'
import { submitActivityFeedback } from '@/lib/api/feedback'
import { useAuth } from '@/lib/auth/auth-context'
import type { FeedbackQuestion, LatestActivity, VoiceRecordingPayload } from '@/lib/types/home'

interface ActivityFeedbackCardProps {
  activity: LatestActivity
  childId: number
  childName: string
  questions: FeedbackQuestion[]
}

export function ActivityFeedbackCard({
  activity,
  childId,
  childName,
  questions,
}: ActivityFeedbackCardProps) {
  const router = useRouter()
  const { setActiveChild } = useAuth()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingPayload | null>(null)
  const [pending, setPending] = useState(false)
  const [browsePending, setBrowsePending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [submitted, setSubmitted] = useState(false)

  const singleChoiceQuestion = questions.find((question) => question.type === 'SINGLE_CHOICE')
  const freeTextQuestion = questions.find((question) => question.type === 'FREE_TEXT')
  const enjoyment = singleChoiceQuestion
    ? answers[singleChoiceQuestion.code] ?? null
    : null
  const canSubmit = Boolean(singleChoiceQuestion && enjoyment)

  function setSingleChoice(questionCode: string, value: string | null) {
    setAnswers((current) => ({ ...current, [questionCode]: value ?? '' }))
  }

  function resetForm() {
    setAnswers({})
    setVoiceRecording(null)
    setError(null)
    setSubmitted(false)
  }

  async function handleBrowseTodayPlan() {
    if (browsePending) return

    setError(null)
    setBrowsePending(true)
    try {
      await fetchTodayDailyPlan(childId)
      setActiveChild({ childId: String(childId), childName })
      router.push('/plan-ready')
    } catch (cause) {
      setError(cause)
      setBrowsePending(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || pending) return

    setError(null)
    setPending(true)
    try {
      if (!enjoyment) return
      // Metin ve ses alanları şimdilik yalnızca arayüzde tutulur; backend'e gönderilmez.
      await submitActivityFeedback(childId, activity.dailyPlanItemId, enjoyment)
      setSubmitted(true)
    } catch (cause) {
      setError(cause)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent>
        {submitted ? (
          <FeedbackSuccessState
            childName={childName}
            onBrowse={handleBrowseTodayPlan}
            browsePending={browsePending}
            browseError={error}
            onStay={resetForm}
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {singleChoiceQuestion ? (
              <EnjoymentSelector
                question={singleChoiceQuestion}
                value={enjoyment}
                onChange={(value) => setSingleChoice(singleChoiceQuestion.code, value)}
                disabled={pending}
              />
            ) : null}

            {freeTextQuestion ? (
              <>
                <Separator />
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2.5">
                    <label
                      htmlFor={`feedback-${freeTextQuestion.code}`}
                      className="text-sm font-semibold leading-relaxed text-foreground"
                    >
                      {freeTextQuestion.body}
                      {freeTextQuestion.required ? (
                        <span className="text-destructive"> *</span>
                      ) : null}
                    </label>
                    {freeTextQuestion.helperText ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {freeTextQuestion.helperText}
                      </p>
                    ) : null}
                    <Textarea
                      id={`feedback-${freeTextQuestion.code}`}
                      value={answers[freeTextQuestion.code] ?? ''}
                      disabled={pending}
                      maxLength={freeTextQuestion.maxLength ?? undefined}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [freeTextQuestion.code]: event.target.value,
                        }))
                      }
                      rows={5}
                      className="min-h-32 rounded-2xl border-input bg-card px-4 py-3 leading-relaxed"
                      placeholder="Deneyiminizi buraya yazabilirsiniz…"
                    />
                    {freeTextQuestion.maxLength ? (
                      <span className="self-end text-xs tabular-nums text-muted-foreground">
                        {(answers[freeTextQuestion.code] ?? '').length}/
                        {freeTextQuestion.maxLength}
                      </span>
                    ) : null}
                  </div>

                  <VoiceFeedbackRecorder
                    recording={voiceRecording}
                    onRecordingChange={setVoiceRecording}
                    disabled={pending}
                  />
                </div>
              </>
            ) : null}

            <ApiErrorAlert error={error} title="Geri bildirim gönderilemedi" />

            <div className="flex flex-col gap-2.5">
              <SubmitButton
                pending={pending}
                pendingLabel="Gönderiliyor…"
                disabled={!canSubmit}
                className="sm:w-fit sm:px-6"
              >
                Geri bildirimimi gönder
                <Send data-icon="inline-end" />
              </SubmitButton>
              {!canSubmit ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Zorunlu soruları yanıtlayarak geri bildirimi gönderebilirsin.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
