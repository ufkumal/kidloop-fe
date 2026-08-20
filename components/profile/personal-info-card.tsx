import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ParentProfile } from '@/lib/types/profile'
import { INPUT_CLASS } from '@/lib/ui'

/** Profil API'sinden gelen ebeveyn bilgilerini salt okunur gösterir. */
export function PersonalInfoCard({ parent }: { parent: ParentProfile }) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="font-heading text-lg font-bold">Kişisel bilgiler</CardTitle>
        <CardDescription className="leading-relaxed">
          Hesabındaki kimlik ve iletişim bilgileri.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="parent-full-name">Ad soyad</FieldLabel>
            <Input
              id="parent-full-name"
              name="fullName"
              autoComplete="name"
              placeholder="Belirtilmedi"
              className={INPUT_CLASS}
              value={parent.fullName}
              readOnly
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="parent-email">E-posta adresi</FieldLabel>
            <Input
              id="parent-email"
              name="email"
              type="email"
              autoComplete="email"
              className={INPUT_CLASS}
              value={parent.email}
              readOnly
            />
            <FieldDescription>Giriş yaparken bu adresi kullanıyorsun.</FieldDescription>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="parent-city">Şehir</FieldLabel>
              <Input
                id="parent-city"
                name="city"
                autoComplete="address-level1"
                placeholder="Belirtilmedi"
                className={INPUT_CLASS}
                value={parent.city}
                readOnly
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="parent-district">İlçe</FieldLabel>
              <Input
                id="parent-district"
                name="district"
                autoComplete="address-level2"
                placeholder="Belirtilmedi"
                className={INPUT_CLASS}
                value={parent.district}
                readOnly
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="parent-phone">Telefon numarası</FieldLabel>
            <Input
              id="parent-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Belirtilmedi"
              className={INPUT_CLASS}
              value={parent.phone}
              readOnly
            />
            <FieldDescription>
              {parent.phone.trim()
                ? 'Yalnızca hesap güvenliği için kullanılır.'
                : 'Profilinde kayıtlı bir telefon numarası yok.'}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
