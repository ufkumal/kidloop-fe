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
import type { EnjoymentLevel, LastActivitySummary, VoiceRecordingPayload } from '@/lib/types/home'

interface ActivityFeedbackCardProps {
  activity: LastActivitySummary
  childId?: string | null
  childName?: string | null
}

export function ActivityFeedbackCard({
  activity,
  childId,
  childName,
}: ActivityFeedbackCardProps) {
  const [enjoyment, setEnjoyment] = useState<EnjoymentLevel | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [text, setText] = useState('')
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecordingPayload | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = hasMeaningfulFeedback({ enjoyment, tags, text, voiceRecording })

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    )
  }

  function resetForm() {
    setEnjoyment(null)
    setTags([])
    setText('')
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
          activityId: activity.id,
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
            <EnjoymentSelector value={enjoyment} onChange={setEnjoyment} disabled={pending} />

            <FeedbackTagSelector selected={tags} onToggle={toggleTag} disabled={pending} />

            <Separator />

            <VoiceFeedbackRecorder
              recording={voiceRecording}
              onRecordingChange={setVoiceRecording}
              disabled={pending}
            />

            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="feedback-text"
                className="text-sm font-semibold leading-relaxed text-foreground"
              >
                Yazarak paylaş
              </label>
              <Textarea
                id="feedback-text"
                value={text}
                disabled={pending}
                onChange={(event) => setText(event.target.value)}
                rows={5}
                className="min-h-32 rounded-2xl border-input bg-card px-4 py-3 leading-relaxed"
                placeholder="Örneğin: İlk başta biraz çekindi ama renkleri aramaya başlayınca çok eğlendi. Özellikle kırmızı nesneleri bulmayı sevdi…"
              />
            </div>

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
                  Göndermek için bir tepki seç, etiket ekle, kısaca yaz veya sesli anlat.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
