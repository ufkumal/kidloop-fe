'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { PasswordInput } from '@/components/auth/password-input'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { ComingSoon } from '@/components/common/coming-soon'
import { SubmitButton } from '@/components/common/submit-button'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { isEmailNotVerifiedError, login } from '@/lib/api/auth'
import { mapApiFieldErrors } from '@/lib/api/field-errors'
import { useAuth } from '@/lib/auth/auth-context'
import { ACTION_BUTTON_CLASS, INPUT_CLASS } from '@/lib/ui'
import { validateEmail, validatePassword } from '@/lib/validation/auth'

export function LoginForm() {
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({})
  const [pending, setPending] = useState(false)
  const [apiError, setApiError] = useState<unknown>(null)
  const [unsupportedRole, setUnsupportedRole] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError(null)

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setPending(true)
    try {
      const session = await login({ email, password })
      signIn(session, remember)

      if (session.role === 'PARENT') {
        // AppBootstrap backend durumunu çözüp kaldığı adıma yönlendirir.
        return
      }
      setUnsupportedRole(true)
    } catch (error) {
      // Hesap henüz doğrulanmadıysa ham sunucu mesajı yerine yönlendirici bir ekran gösterilir.
      if (isEmailNotVerifiedError(error)) {
        setUnverifiedEmail(email.trim())
        return
      }
      setApiError(error)
      const serverErrors = mapApiFieldErrors(error, ['email', 'password'])
      if (Object.keys(serverErrors).length > 0) {
        setErrors((current) => ({ ...current, ...serverErrors }))
      }
    } finally {
      setPending(false)
    }
  }

  if (unverifiedEmail) {
    return (
      <AuthCard
        title="E-postanı doğrulaman gerekiyor"
        description="Hesabın oluşturuldu ancak henüz etkinleştirilmedi."
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary-soft px-5 py-6 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-soft"
          >
            <MailCheck className="size-6" />
          </span>
          <p className="leading-relaxed text-foreground">
            <span className="font-medium">{unverifiedEmail}</span> adresine gönderdiğimiz doğrulama
            bağlantısına dokunduktan sonra giriş yapabilirsin.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            E-postayı göremiyorsan gereksiz (spam) klasörünü kontrol etmeyi dene.
          </p>
        </div>

        <Button
          size="lg"
          variant="outline"
          className={ACTION_BUTTON_CLASS}
          onClick={() => setUnverifiedEmail(null)}
        >
          Giriş ekranına dön
        </Button>
      </AuthCard>
    )
  }

  if (unsupportedRole) {
    return (
      <ComingSoon
        title="Bu alan yakında"
        description="Atölye ve yönetici panelleri üzerinde çalışıyoruz. Hazır olduğunda hesabınla buradan giriş yapabileceksin."
      />
    )
  }

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      description="Çocuğuna uygun etkinlik önerilerine devam etmek için giriş yap."
      footer={
        <>
          Hesabın yok mu?{' '}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Ücretsiz oluştur
          </Link>
        </>
      }
    >
      <ApiErrorAlert error={apiError} title="Giriş yapılamadı" />

      <form method="post" noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="login-email">E-posta</FieldLabel>
            <Input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              className={INPUT_CLASS}
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.password ? true : undefined}>
            <div className="flex items-baseline justify-between gap-3">
              <FieldLabel htmlFor="login-password">Şifre</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Şifremi unuttum?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              invalid={Boolean(errors.password)}
            />
            {errors.password ? <FieldError>{errors.password}</FieldError> : null}
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="login-remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <FieldLabel htmlFor="login-remember" className="font-normal">
              Beni hatırla
            </FieldLabel>
          </Field>
        </FieldGroup>

        <SubmitButton pending={pending} pendingLabel="Giriş yapılıyor…">
          Giriş yap
        </SubmitButton>
      </form>

      <SocialAuthButtons />
    </AuthCard>
  )
}
