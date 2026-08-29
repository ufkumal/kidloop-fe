'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Mic, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RecorderState = 'idle' | 'recording' | 'transcribing' | 'completed' | 'error'

const MAX_RECORDING_SECONDS = 120
const MIME_TYPE_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm']

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function recorderMimeType() {
  return MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type))
}

function microphoneErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return 'Ses kaydı başlatılamadı. Lütfen tekrar dene.'
  }
  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
    return 'Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verip tekrar dene.'
  }
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'Kullanılabilir bir mikrofon bulunamadı.'
  }
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'Mikrofon şu anda kullanılamıyor. Başka bir uygulamanın mikrofonu kullanmadığından emin ol.'
  }
  return 'Mikrofona erişilemedi. Lütfen tekrar dene.'
}

interface VoiceFeedbackRecorderProps {
  onTranscription: (transcription: string) => void
  disabled?: boolean
}

export function VoiceFeedbackRecorder({
  onTranscription,
  disabled,
}: VoiceFeedbackRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [message, setMessage] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const limitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)
  const stoppedAtLimitRef = useRef(false)
  const requestControllerRef = useRef<AbortController | null>(null)
  const startingRef = useRef(false)
  const mountedRef = useRef(true)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current)
    timerRef.current = null
    limitTimerRef.current = null
  }, [])

  const releaseMicrophone = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const transcribe = useCallback(
    async (audio: Blob) => {
      if (audio.size === 0) {
        setState('error')
        setMessage('Kayıt boş görünüyor. Lütfen tekrar kaydet.')
        return
      }

      const controller = new AbortController()
      requestControllerRef.current = controller
      const formData = new FormData()
      formData.append('audio', audio, 'feedback.webm')

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })
        const payload: unknown = await response.json().catch(() => null)
        const text =
          payload && typeof payload === 'object' && typeof (payload as { text?: unknown }).text === 'string'
            ? (payload as { text: string }).text.trim()
            : ''

        if (!response.ok) {
          throw new Error('Transcription request failed')
        }
        if (!text) {
          setState('error')
          setMessage('Konuşma metne dönüştürülemedi. Lütfen tekrar dene veya yazarak devam et.')
          return
        }

        onTranscription(text)
        setState('completed')
        setMessage(
          stoppedAtLimitRef.current
            ? 'İki dakikalık sınıra ulaşıldı. Metin geri bildirim alanına eklendi.'
            : 'Konuşman geri bildirim alanına eklendi. Göndermeden önce düzenleyebilirsin.',
        )
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Voice feedback transcription failed:', error)
        setState('error')
        setMessage('Ses metne dönüştürülemedi. Yazarak devam edebilir veya tekrar deneyebilirsin.')
      } finally {
        requestControllerRef.current = null
      }
    },
    [onTranscription],
  )

  const stopRecording = useCallback(
    (atLimit = false) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') return
      stoppedAtLimitRef.current = atLimit
      clearTimers()
      setState('transcribing')
      setMessage(atLimit ? 'İki dakikalık sınıra ulaşıldı. Ses metne dönüştürülüyor…' : '')
      recorder.stop()
    },
    [clearTimers],
  )

  const startRecording = useCallback(async () => {
    if (startingRef.current) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error')
      setMessage('Bu tarayıcı mikrofonla ses kaydını desteklemiyor. Yazarak devam edebilirsin.')
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      setState('error')
      setMessage('Bu tarayıcı ses kaydını desteklemiyor. Yazarak devam edebilirsin.')
      return
    }

    setMessage('')
    setElapsed(0)
    cancelledRef.current = false
    stoppedAtLimitRef.current = false
    chunksRef.current = []
    startingRef.current = true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const preferredMimeType = recorderMimeType()
      const recorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onerror = (event) => {
        console.error('MediaRecorder failed:', event)
        cancelledRef.current = true
        recorder.onstop = null
        clearTimers()
        releaseMicrophone()
        setState('error')
        setMessage('Ses kaydı sırasında bir sorun oluştu. Lütfen tekrar dene.')
      }
      recorder.onstop = () => {
        clearTimers()
        releaseMicrophone()
        recorderRef.current = null
        if (cancelledRef.current) return

        const mimeType = recorder.mimeType || preferredMimeType || 'audio/webm'
        const audio = new Blob(chunksRef.current, { type: mimeType })
        chunksRef.current = []
        void transcribe(audio)
      }

      recorder.start(1000)
      setState('recording')
      timerRef.current = setInterval(() => {
        setElapsed((current) => Math.min(current + 1, MAX_RECORDING_SECONDS))
      }, 1000)
      limitTimerRef.current = setTimeout(() => stopRecording(true), MAX_RECORDING_SECONDS * 1000)
    } catch (error) {
      console.error('Microphone access failed:', error)
      releaseMicrophone()
      if (mountedRef.current) {
        setState('error')
        setMessage(microphoneErrorMessage(error))
      }
    } finally {
      startingRef.current = false
    }
  }, [clearTimers, releaseMicrophone, stopRecording, transcribe])

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true
    clearTimers()
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    releaseMicrophone()
    recorderRef.current = null
    chunksRef.current = []
    setElapsed(0)
    setMessage('')
    setState('idle')
  }, [clearTimers, releaseMicrophone])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelledRef.current = true
      clearTimers()
      requestControllerRef.current?.abort()
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null
        recorder.stop()
      }
      releaseMicrophone()
    }
  }, [clearTimers, releaseMicrophone])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold leading-relaxed text-foreground">Anlatarak paylaş</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mikrofona dokun ve deneyimini kendi cümlelerinle anlat.
        </p>
      </div>

      <div
        className={cn(
          'flex flex-col gap-4 rounded-2xl border border-dashed px-4 py-4 transition-colors sm:px-5',
          state === 'recording' ? 'border-orange/50 bg-orange-soft' : 'border-border bg-warm/60',
        )}
      >
        {state === 'recording' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange text-orange-foreground">
                <span className="absolute inset-0 rounded-2xl bg-orange/40 motion-safe:animate-ping" />
                <Mic className="relative size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">Kaydediliyor…</span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {formatDuration(elapsed)} / 02:00
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={() => stopRecording()}
                className="h-11 w-full rounded-xl sm:w-fit sm:px-5"
              >
                <Square data-icon="inline-start" />
                Kaydı bitir
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={cancelRecording}
                className="h-11 w-full rounded-xl sm:w-fit sm:px-4"
              >
                <X data-icon="inline-start" />
                Vazgeç
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={disabled || state === 'transcribing'}
              onClick={() => void startRecording()}
              className="h-12 w-full rounded-xl border-primary/40 bg-card text-primary hover:bg-primary-soft hover:text-primary sm:w-fit sm:px-5"
            >
              {state === 'transcribing' ? null : state === 'completed' ? (
                <Check data-icon="inline-start" />
              ) : (
                <Mic data-icon="inline-start" className="size-5" />
              )}
              {state === 'transcribing'
                ? 'Metne dönüştürülüyor…'
                : state === 'completed'
                  ? 'Tekrar kaydet'
                  : 'Konuşarak geri bildirim ver'}
            </Button>
            {state === 'idle' ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dilersen yalnızca yazarak da paylaşabilirsin.
              </p>
            ) : null}
          </div>
        )}

        {message ? (
          <p
            role={state === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={cn(
              'text-sm leading-relaxed',
              state === 'error' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
