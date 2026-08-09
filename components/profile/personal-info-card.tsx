'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/common/submit-button'
import type { ParentProfile } from '@/lib/types/profile'
import { INPUT_CLASS } from '@/lib/ui'

/**
 * Kişisel bilgiler formu.
 * Yalnızca yerel (local) durum tutar — API çağrısı veya kalıcı kayıt yoktur.
 * TODO(entegrasyon): kaydetme akışı ebeveyn güncelleme ucuna bağlanacak.
 */
export function PersonalInfoCard({ parent }: { parent: ParentProfile }) {
  const [form, setForm] = useState(parent)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function update(key: keyof ParentProfile, value: string) {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Ağ çağrısı yok: yalnızca kaydetme durumunun (disabled/loading) tasarımı gösterilir.
    setPending(true)
    timerRef.current = setTimeout(() => {
      setPending(false)
      setSaved(true)
    }, 600)
  }

  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="font-heading text-lg font-bold">Kişisel bilgiler</CardTitle>
        <CardDescription className="leading-relaxed">
          Hesabındaki iletişim bilgilerini güncel tutabilirsin.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="parent-first-name">Ad</FieldLabel>
                <Input
                  id="parent-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  className={INPUT_CLASS}
                  value={form.firstName}
                  onChange={(event) => update('firstName', event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="parent-last-name">Soyad</FieldLabel>
                <Input
                  id="parent-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  className={INPUT_CLASS}
                  value={form.lastName}
                  onChange={(event) => update('lastName', event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="parent-email">E-posta adresi</FieldLabel>
              <Input
                id="parent-email"
                name="email"
                type="email"
                autoComplete="email"
                className={INPUT_CLASS}
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
              />
              <FieldDescription>Giriş yaparken bu adresi kullanıyorsun.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="parent-phone">Telefon numarası</FieldLabel>
              <Input
                id="parent-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Telefon numarası ekle"
                className={INPUT_CLASS}
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
              />
              <FieldDescription>
                {form.phone.trim()
                  ? 'Yalnızca hesap güvenliği için kullanılır.'
                  : 'Telefon numarası ekle: hesabını kurtarmak gerektiğinde işine yarar.'}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {saved ? (
            <Alert className="border-primary/30 bg-primary-soft text-primary">
              <CheckCircle2 aria-hidden="true" />
              <AlertTitle>Bilgilerin güncellendi.</AlertTitle>
            </Alert>
          ) : null}

          <SubmitButton
            pending={pending}
            pendingLabel="Kaydediliyor…"
            className="sm:w-fit sm:px-6"
          >
            Değişiklikleri kaydet
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
