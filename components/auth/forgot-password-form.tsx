'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { SubmitButton } from '@/components/common/submit-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { INPUT_CLASS } from '@/lib/ui'
import { validateEmail } from '@/lib/validation/auth'

/**
 * Şifre sıfırlama için backend ucu henüz yok.
 * Bu ekran yalnızca istemci tarafı doğrulama yapar ve bilgilendirir;
 * sahte bir istek atılmaz.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextError = validateEmail(email)
    setError(nextError)
    if (nextError) {
      setSubmittedEmail(null)
      return
    }

    setSubmittedEmail(email.trim())
  }

  return (
    <AuthCard
      title="Şifreni mi unuttun?"
      description="E-posta adresini yaz, sıfırlama bağlantısı hazır olduğunda ilk sen haberdar ol."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Giriş ekranına dön
        </Link>
      }
    >
      {submittedEmail ? (
        <Alert className="rounded-2xl border-border bg-warm px-4 py-3 text-warm-foreground">
          <Clock />
          <AlertTitle>Şifre sıfırlama altyapısı yakında aktif olacak.</AlertTitle>
          <AlertDescription>
            <span className="font-medium">{submittedEmail}</span> adresini not aldık. Bu özellik
            açıldığında sıfırlama bağlantısını buradan gönderebileceksin.
          </AlertDescription>
        </Alert>
      ) : null}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="forgot-email">E-posta</FieldLabel>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby="forgot-email-hint"
              className={INPUT_CLASS}
            />
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription id="forgot-email-hint">
                Hesabını oluştururken kullandığın adresi gir.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <SubmitButton>Sıfırlama bağlantısı gönder</SubmitButton>
      </form>
    </AuthCard>
  )
}
