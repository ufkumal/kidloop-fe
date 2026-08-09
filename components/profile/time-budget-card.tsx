'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { TimeBudgetValue } from '@/lib/types/profile'
import { INPUT_CLASS } from '@/lib/ui'
import { cn } from '@/lib/utils'

const OPTIONS: { value: TimeBudgetValue; label: string; hint: string }[] = [
  { value: '15', label: '15 dakika', hint: 'Kısa ve odaklı' },
  { value: '30', label: '30 dakika', hint: 'Dengeli' },
  { value: '45', label: '45 dakika', hint: 'Ferah' },
  { value: '60', label: '60 dakika', hint: 'Uzun oyun' },
  { value: 'custom', label: 'Özel', hint: 'Kendin belirle' },
]

/**
 * Günlük zaman bütçesi tercihi. Ebeveyn hesabı düzeyinde saklanır,
 * çocuk bazlı değildir. Şimdilik yalnızca yerel etkileşim.
 * TODO(entegrasyon): seçim ebeveyn tercih ucuna kaydedilecek.
 */
export function TimeBudgetCard({ initialValue }: { initialValue: TimeBudgetValue }) {
  const [value, setValue] = useState<TimeBudgetValue>(initialValue)
  const [customMinutes, setCustomMinutes] = useState('')

  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-bold">
          <Clock className="size-5 text-primary" aria-hidden="true" />
          Günlük zaman bütçesi
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          Etkinlik önerilerini günlük ayırabileceğin zamana göre düzenleyelim.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <RadioGroup
          value={value}
          onValueChange={(next) => setValue(next as TimeBudgetValue)}
          aria-label="Günlük zaman bütçesi"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {OPTIONS.map((option) => {
            const itemId = `time-budget-${option.value}`

            return (
              <label
                key={option.value}
                htmlFor={itemId}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors',
                  'hover:border-primary/40 hover:bg-primary-soft/40',
                  'has-data-checked:border-primary has-data-checked:bg-primary-soft',
                  'has-focus-visible:border-primary',
                )}
              >
                <RadioGroupItem id={itemId} value={option.value} className="mt-0.5" />
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold leading-snug text-foreground">{option.label}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </label>
            )
          })}
        </RadioGroup>

        {value === 'custom' ? (
          <Field className="max-w-xs">
            <FieldLabel htmlFor="time-budget-custom">Özel süre (dakika)</FieldLabel>
            <Input
              id="time-budget-custom"
              type="number"
              inputMode="numeric"
              min={5}
              max={180}
              placeholder="Örn. 40"
              className={INPUT_CLASS}
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
            />
          </Field>
        ) : null}

        <FieldDescription>
          Bu tercih tüm çocuklar için geçerlidir; çocuk bazlı değil, ebeveyn hesabı ayarıdır.
        </FieldDescription>
      </CardContent>
    </Card>
  )
}
