'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { EnjoymentSelector } from '@/components/home/enjoyment-selector'
import { FeedbackSuccessState } from '@/components/home/feedback-success-state'
import { FeedbackTagSelector } from '@/components/home/feedback-tag-selector'
import { VoiceFeedbackRecorder } from '@/components/home/voice-feedback-recorder'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  buildActivityFeedback,
  hasMeaningfulFeedback,
  submitActivityFeedback,
} from '@/lib/api/feedback'
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
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingPayload | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [submitted, setSubmitted] = useState(false)

  const singleChoiceQuestion = questions.find((question) => question.type === 'SINGLE_CHOICE')
  const multiChoiceQuestion = questions.find((question) => question.type === 'MULTI_CHOICE')
  const freeTextQuestion = questions.find((question) => question.type === 'FREE_TEXT')
  const enjoyment = singleChoiceQuestion
    ? (answers[singleChoiceQuestion.code] as string | undefined) ?? null
    : null
  const tags = multiChoiceQuestion
    ? (answers[multiChoiceQuestion.code] as string[] | undefined) ?? []
    : []
  const text = freeTextQuestion
    ? (answers[freeTextQuestion.code] as string | undefined) ?? ''
    : ''

  const requiredQuestionsAnswered = questions.every((question) => {
    if (!question.required) return true
    const answer = answers[question.code]
    if (question.type === 'MULTI_CHOICE') return Array.isArray(answer) && answer.length > 0
    if (question.type === 'FREE_TEXT') {
      return (typeof answer === 'string' && answer.trim().length > 0) || Boolean(voiceRecording)
    }
    return typeof answer === 'string' && answer.length > 0
  })
  const canSubmit =
    requiredQuestionsAnswered &&
    hasMeaningfulFeedback({ enjoyment, tags, text, voiceRecording })

  function setSingleChoice(questionCode: string, value: string | null) {
    setAnswers((current) => ({ ...current, [questionCode]: value ?? '' }))
  }

  function toggleOption(questionCode: string, optionCode: string) {
    setAnswers((current) => {
      const selected = (current[questionCode] as string[] | undefined) ?? []
      return {
        ...current,
        [questionCode]: selected.includes(optionCode)
          ? selected.filter((item) => item !== optionCode)
          : [...selected, optionCode],
      }
    })
  }

  function resetForm() {
    setAnswers({})
    setVoiceRecording(null)
    setSubmitted(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || pending) return

    setError(null)
    setPending(true)
    try {
      await submitActivityFeedback(
        buildActivityFeedback({
          activityId: activity.activityId,
          childId,
          enjoyment,
          tags,
          text,
          voiceRecording,
        }),
      )
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
          <FeedbackSuccessState childName={childName} onStay={resetForm} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {questions.map((question, index) => (
              <div key={question.code} className="contents">
                {index > 0 ? <Separator /> : null}

                {question.type === 'SINGLE_CHOICE' ? (
                  <EnjoymentSelector
                    question={question}
                    value={(answers[question.code] as string | undefined) ?? null}
                    onChange={(value) => setSingleChoice(question.code, value)}
                    disabled={pending}
                  />
                ) : null}

                {question.type === 'MULTI_CHOICE' ? (
                  <FeedbackTagSelector
                    question={question}
                    selected={(answers[question.code] as string[] | undefined) ?? []}
                    onToggle={(optionCode) => toggleOption(question.code, optionCode)}
                    disabled={pending}
                  />
                ) : null}

                {question.type === 'FREE_TEXT' ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2.5">
                      <label
                        htmlFor={`feedback-${question.code}`}
                        className="text-sm font-semibold leading-relaxed text-foreground"
                      >
                        {question.body}
                        {question.required ? <span className="text-destructive"> *</span> : null}
                      </label>
                      {question.helperText ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {question.helperText}
                        </p>
                      ) : null}
                      <Textarea
                        id={`feedback-${question.code}`}
                        value={(answers[question.code] as string | undefined) ?? ''}
                        disabled={pending}
                        maxLength={question.maxLength ?? undefined}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.code]: event.target.value,
                          }))
                        }
                        rows={5}
                        className="min-h-32 rounded-2xl border-input bg-card px-4 py-3 leading-relaxed"
                        placeholder="Deneyiminizi buraya yazabilirsiniz…"
                      />
                      {question.maxLength ? (
                        <span className="self-end text-xs tabular-nums text-muted-foreground">
                          {((answers[question.code] as string | undefined) ?? '').length}/
                          {question.maxLength}
                        </span>
                      ) : null}
                    </div>

                    <VoiceFeedbackRecorder
                      recording={voiceRecording}
                      onRecordingChange={setVoiceRecording}
                      disabled={pending}
                    />
                  </div>
                ) : null}
              </div>
            ))}

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
