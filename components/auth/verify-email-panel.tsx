'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CircleCheck, MailQuestion } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { Button } from '@/components/ui/button'
import { verifyEmail } from '@/lib/api/auth'
import { ACTION_BUTTON_CLASS } from '@/lib/ui'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function VerifyEmailPanel() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'idle')
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!token) {
      setStatus('idle')
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    verifyEmail(token, controller.signal)
      .then(() => setStatus('success'))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause)
        setStatus('error')
      })

    return () => controller.abort()
  }, [token, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  const loginButton = (
    <Button size="lg" nativeButton={false} className={ACTION_BUTTON_CLASS} render={<Link href="/login" />}>
      Giriş ekranına dön
    </Button>
  )

  if (!token) {
    return (
      <AuthCard
        title="Doğrulama bağlantısı bulunamadı"
        description="Bu sayfayı e-postandaki doğrulama bağlantısıyla açman gerekiyor."
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-warm px-5 py-6 text-center text-warm-foreground">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-card text-orange shadow-soft"
          >
            <MailQuestion className="size-6" />
          </span>
          <p className="leading-relaxed">
            Bağlantının süresi dolmuş olabilir. Yeni bir doğrulama e-postası için giriş yapmayı
            dene.
          </p>
        </div>
        {loginButton}
      </AuthCard>
    )
  }

  if (status === 'loading') {
    return (
      <AuthCard
        title="E-postan doğrulanıyor"
        description="Bağlantını kontrol ediyoruz, bu yalnızca birkaç saniye sürer."
      >
        <LoadingState label="E-postan doğrulanıyor…" variant="spinner" />
      </AuthCard>
    )
  }

  if (status === 'success') {
    return (
      <AuthCard
        title="E-postan doğrulandı"
        description="Artık Kidloop hesabınla giriş yapıp çocuğunu tanıtmaya başlayabilirsin."
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-primary-soft px-5 py-6 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-soft"
          >
            <CircleCheck className="size-6" />
          </span>
          <p className="leading-relaxed text-foreground">Her şey hazır, hoş geldin.</p>
        </div>
        {loginButton}
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Doğrulama tamamlanamadı"
      description="Bağlantı geçersiz veya süresi dolmuş olabilir."
    >
      <ApiErrorAlert error={error} title="E-posta doğrulanamadı" onRetry={retry} />
      {loginButton}
    </AuthCard>
  )
}
