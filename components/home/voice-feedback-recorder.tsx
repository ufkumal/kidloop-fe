'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, Square, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VoiceRecordingPayload } from '@/lib/types/home'
import { cn } from '@/lib/utils'

/**
 * Ses geri bildirimi — yalnızca arayüz prototipi.
 *
 * TODO(backend): Gerçek kayıt ve transkripsiyon henüz yok. Kayıt süresi
 * yerel olarak sayılır, ses dosyası üretilmez ve hiçbir mikrofon izni
 * istenmez. Kidloop ses ucu hazır olduğunda MediaRecorder ile gerçek kayıt
 * bu bileşende yapılacak; dışa verilen VoiceRecordingPayload şekli aynı kalır.
 * Yazarak paylaşma yolu her zaman açık kalmalıdır.
 */

type RecorderState = 'idle' | 'recording' | 'ready'

const WAVE_BARS = [0.35, 0.6, 0.95, 0.5, 0.8, 0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.65]

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface VoiceFeedbackRecorderProps {
  recording: VoiceRecordingPayload | null
  onRecordingChange: (recording: VoiceRecordingPayload | null) => void
  disabled?: boolean
}

export function VoiceFeedbackRecorder({
  recording,
  onRecordingChange,
  disabled,
}: VoiceFeedbackRecorderProps) {
  const [state, setState] = useState<RecorderState>(recording ? 'ready' : 'idle')
  const [elapsed, setElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (playbackRef.current) {
      clearTimeout(playbackRef.current)
      playbackRef.current = null
    }
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /** TODO(backend): gerçek MediaRecorder akışıyla değiştirilecek. */
  function startMockRecording() {
    setElapsed(0)
    setIsPlaying(false)
    setState('recording')
    timerRef.current = setInterval(() => {
      setElapsed((current) => current + 1)
    }, 1000)
  }

  function stopMockRecording() {
    clearTimers()
    setState('ready')
    // Süre 0 kalırsa gönderim koşulunu tetiklemesin diye en az 1 saniye.
    onRecordingChange({ durationSeconds: Math.max(elapsed, 1) })
  }

  function cancelMockRecording() {
    clearTimers()
    setElapsed(0)
    setState('idle')
    onRecordingChange(null)
  }

  function removeMockRecording() {
    clearTimers()
    setElapsed(0)
    setIsPlaying(false)
    setState('idle')
    onRecordingChange(null)
  }

  /** TODO(backend): kayıt gerçek olduğunda <audio> öğesiyle oynatılacak. */
  function toggleMockPlayback() {
    if (isPlaying) {
      if (playbackRef.current) clearTimeout(playbackRef.current)
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    playbackRef.current = setTimeout(
      () => setIsPlaying(false),
      Math.min((recording?.durationSeconds ?? 1) * 1000, 4000),
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold leading-relaxed text-foreground">Anlatarak paylaş</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mikrofona dokun ve deneyiminizi kendi cümlelerinle anlat.
        </p>
      </div>

      <div
        className={cn(
          'flex flex-col gap-4 rounded-2xl border px-4 py-4 transition-colors sm:px-5',
          state === 'recording'
            ? 'border-orange/50 bg-orange-soft'
            : 'border-border bg-warm/60 border-dashed',
        )}
      >
        {state === 'idle' ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={disabled}
              onClick={startMockRecording}
              className="h-12 w-full rounded-xl border-primary/40 bg-card text-primary hover:bg-primary-soft hover:text-primary sm:w-fit sm:px-5"
            >
              <Mic data-icon="inline-start" className="size-5" />
              Kaydı başlat
            </Button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dilersen bunun yerine aşağıya yazabilirsin.
            </p>
          </div>
        ) : null}

        {state === 'recording' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange text-orange-foreground"
              >
                <span className="absolute inset-0 rounded-2xl bg-orange/40 motion-safe:animate-ping" />
                <Mic className="relative size-5" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Kaydediliyor
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {formatDuration(elapsed)}
                  </span>
                </span>
                {/* Dekoratif dalga — durum yalnızca renkle anlatılmaz, metin de vardır. */}
                <span aria-hidden="true" className="flex h-6 items-end gap-1">
                  {WAVE_BARS.map((height, index) => (
                    <span
                      key={index}
                      className="w-1.5 rounded-full bg-orange/70 motion-safe:animate-pulse"
                      style={{
                        height: `${Math.round(height * 100)}%`,
                        animationDelay: `${index * 90}ms`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>

            <p role="status" aria-live="polite" className="sr-only">
              {`Kayıt sürüyor, ${elapsed} saniye`}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={stopMockRecording}
                className="h-11 w-full rounded-xl sm:w-fit sm:px-5"
              >
                <Square data-icon="inline-start" />
                Kaydı bitir
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={cancelMockRecording}
                className="h-11 w-full rounded-xl sm:w-fit sm:px-4"
              >
                <X data-icon="inline-start" />
                Vazgeç
              </Button>
            </div>
          </div>
        ) : null}

        {state === 'ready' && recording ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                disabled={disabled}
                aria-label={isPlaying ? 'Kaydı duraklat' : 'Kaydı dinle'}
                onClick={toggleMockPlayback}
                className="size-12 shrink-0 rounded-2xl border-primary/40 bg-card text-primary hover:bg-primary-soft hover:text-primary"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </Button>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {isPlaying ? 'Dinleniyor' : 'Kaydın hazır'}
                </span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {formatDuration(recording.durationSeconds)}
                </span>
              </div>

              <Button
                type="button"
                size="icon-lg"
                variant="ghost"
                disabled={disabled}
                aria-label="Kaydı sil ve yeniden kaydet"
                onClick={removeMockRecording}
                className="size-11 shrink-0 rounded-xl text-muted-foreground"
              >
                <Trash2 className="size-4.5" />
              </Button>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Kaydı silip yeniden anlatabilirsin.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
