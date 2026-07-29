'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { PasswordInput } from '@/components/auth/password-input'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { SubmitButton } from '@/components/common/submit-button'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { registerParent } from '@/lib/api/auth'
import { mapApiFieldErrors } from '@/lib/api/field-errors'
import { ACTION_BUTTON_CLASS, INPUT_CLASS } from '@/lib/ui'
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateRequiredName,
} from '@/lib/validation/auth'

interface FormErrors {
  name?: string | null
  email?: string | null
  password?: string | null
  passwordConfirm?: string | null
}

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [pending, setPending] = useState(false)
  const [apiError, setApiError] = useState<unknown>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError(null)

    const nextErrors: FormErrors = {
      name: validateRequiredName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      passwordConfirm: validatePasswordConfirm(password, passwordConfirm),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setPending(true)
    try {
      // "Adın" yalnızca arayüzde toplanır, backend sözleşmesinde yer almadığı için gönderilmez.
      await registerParent({ email, password })
      setRegisteredEmail(email.trim())
    } catch (error) {
      setApiError(error)
      // Sunucu alan bazlı hata döndüyse ilgili alanların altında da göster.
      const serverErrors = mapApiFieldErrors(error, ['email', 'password'])
      if (Object.keys(serverErrors).length > 0) {
        setErrors((current) => ({ ...current, ...serverErrors }))
      }
    } finally {
      setPending(false)
    }
  }

  if (registeredEmail) {
    return (
      <AuthCard
        title="E-postanı doğrula"
        description="Hesabını etkinleştirmek için sana bir doğrulama bağlantısı gönderdik."
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary-soft px-5 py-6 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-soft"
          >
            <MailCheck className="size-6" />
          </span>
          <p className="leading-relaxed text-foreground">
            <span className="font-medium">{registeredEmail}</span> adresine gelen bağlantıya
            dokunduğunda hesabın hazır olacak.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            E-postayı göremiyorsan gereksiz (spam) klasörünü kontrol etmeyi dene.
          </p>
        </div>

        <Button size="lg" nativeButton={false} className={ACTION_BUTTON_CLASS} render={<Link href="/login" />}>
          Giriş ekranına dön
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Kidloop’a katıl"
      description="Çocuğuna uygun etkinlik önerileri için birkaç adımda hesabını oluştur."
      footer={
        <>
          Hesabın var mı?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <ApiErrorAlert error={apiError} title="Kayıt tamamlanamadı" />

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="register-name">Adın</FieldLabel>
            <Input
              id="register-name"
              name="name"
              autoComplete="given-name"
              placeholder="Örn. Elif"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby="register-name-hint"
              className={INPUT_CLASS}
            />
            {errors.name ? (
              <FieldError>{errors.name}</FieldError>
            ) : (
              <FieldDescription id="register-name-hint">
                Sana buradan hitap edeceğiz.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="register-email">E-posta</FieldLabel>
            <Input
              id="register-email"
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
            <FieldLabel htmlFor="register-password">Şifre</FieldLabel>
            <PasswordInput
              id="register-password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              invalid={Boolean(errors.password)}
              describedBy="register-password-hint"
            />
            {errors.password ? (
              <FieldError>{errors.password}</FieldError>
            ) : (
              <FieldDescription id="register-password-hint">
                En az {PASSWORD_MIN_LENGTH} karakter kullan.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={errors.passwordConfirm ? true : undefined}>
            <FieldLabel htmlFor="register-password-confirm">Şifreyi tekrar et</FieldLabel>
            <PasswordInput
              id="register-password-confirm"
              name="passwordConfirm"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              invalid={Boolean(errors.passwordConfirm)}
            />
            {errors.passwordConfirm ? <FieldError>{errors.passwordConfirm}</FieldError> : null}
          </Field>
        </FieldGroup>

        <SubmitButton pending={pending} pendingLabel="Hesabın oluşturuluyor…">
          Hesap oluştur
        </SubmitButton>
      </form>

      <SocialAuthButtons />
    </AuthCard>
  )
}
