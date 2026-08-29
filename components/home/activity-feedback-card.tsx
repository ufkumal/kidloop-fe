'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { EnjoymentSelector } from '@/components/home/enjoyment-selector'
import { VoiceFeedbackRecorder } from '@/components/home/voice-feedback-recorder'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  MAX_FREE_TEXT_FEEDBACK_LENGTH,
  submitActivityFeedback,
} from '@/lib/api/feedback'
import type {
  ActivityFeedbackType,
  FeedbackQuestion,
  LatestActivity,
} from '@/lib/types/home'

const FEEDBACK_TYPES: ActivityFeedbackType[] = ['LIKED', 'STRUGGLED', 'DISLIKED']

interface ActivityFeedbackCardProps {
  activity: LatestActivity
  childId: number
  questions: FeedbackQuestion[]
  onSubmitted: () => void
}

export function ActivityFeedbackCard({
  activity,
  childId,
  questions,
  onSubmitted,
}: ActivityFeedbackCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const singleChoiceQuestion = questions.find((question) => question.type === 'SINGLE_CHOICE')
  const freeTextQuestion = questions.find((question) => question.type === 'FREE_TEXT')
  const enjoyment = singleChoiceQuestion ? answers[singleChoiceQuestion.code] ?? null : null
  const feedbackType = FEEDBACK_TYPES.find((type) => type === enjoyment) ?? null
  const freeText = freeTextQuestion ? answers[freeTextQuestion.code] ?? '' : ''
  const freeTextMaxLength = Math.min(
    freeTextQuestion?.maxLength ?? MAX_FREE_TEXT_FEEDBACK_LENGTH,
    MAX_FREE_TEXT_FEEDBACK_LENGTH,
  )
  const canSubmit = Boolean(
    feedbackType &&
      freeText.length <= freeTextMaxLength &&
      (!freeTextQuestion?.required || freeText.trim().length > 0),
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !feedbackType || pending) return

    setError(null)
    setPending(true)
    try {
      await submitActivityFeedback(childId, activity.dailyPlanItemId, feedbackType, freeText)
      onSubmitted()
    } catch (cause) {
      setError(cause)
      setPending(false)
    }
  }

  function appendTranscription(transcription: string) {
    if (!freeTextQuestion) return

    setAnswers((current) => {
      const existing = current[freeTextQuestion.code] ?? ''
      const separator = existing.length > 0 && !/\s$/.test(existing) ? '\n\n' : ''
      return {
        ...current,
        [freeTextQuestion.code]: `${existing}${separator}${transcription}`,
      }
    })
  }

  return (
    <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {singleChoiceQuestion ? (
            <EnjoymentSelector
              question={singleChoiceQuestion}
              value={enjoyment}
              onChange={(value) =>
                setAnswers((current) => ({
                  ...current,
                  [singleChoiceQuestion.code]: value ?? '',
                }))
              }
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
                    {freeTextQuestion.required ? <span className="text-destructive"> *</span> : null}
                  </label>
                  {freeTextQuestion.helperText ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {freeTextQuestion.helperText}
                    </p>
                  ) : null}
                  <Textarea
                    id={`feedback-${freeTextQuestion.code}`}
                    value={freeText}
                    disabled={pending}
                    maxLength={freeTextMaxLength}
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
                  {freeText.length > freeTextMaxLength ? (
                    <p role="alert" className="text-sm leading-relaxed text-destructive">
                      Metin {freeTextMaxLength} karakteri geçemez. Göndermeden önce kısaltmalısın.
                    </p>
                  ) : null}
                </div>
                <VoiceFeedbackRecorder
                  onTranscription={appendTranscription}
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
      </CardContent>
    </Card>
  )
}
