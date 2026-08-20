'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldDescription } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDailyTimeBudget, updateDailyTimeBudget } from '@/lib/api/profile'
import type { DailyTimeBudget } from '@/lib/types/profile'
import { cn } from '@/lib/utils'

export function TimeBudgetCard() {
  const [budget, setBudget] = useState<DailyTimeBudget | null>(null)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [updateError, setUpdateError] = useState<unknown>(null)
  const [pendingOptionCode, setPendingOptionCode] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setLoadError(null)
    setBudget(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchDailyTimeBudget(controller.signal)
      .then(setBudget)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setLoadError(requestError)
      })
    return () => controller.abort()
  }, [requestVersion])

  async function handleChange(optionCode: string) {
    if (!budget || optionCode === budget.selectedOptionCode || pendingOptionCode) return

    const previousCode = budget.selectedOptionCode
    setSaved(false)
    setUpdateError(null)
    setPendingOptionCode(optionCode)
    setBudget((current) => current && { ...current, selectedOptionCode: optionCode })

    try {
      const response = await updateDailyTimeBudget(optionCode)
      setBudget((current) =>
        current && {
          ...current,
          selectedOptionCode: response.answeredOptionCode,
          dailyTimeBudgetMinutes: response.dailyTimeBudgetMinutes,
        },
      )
      setSaved(true)
    } catch (requestError) {
      setBudget((current) => current && { ...current, selectedOptionCode: previousCode })
      setUpdateError(requestError)
    } finally {
      setPendingOptionCode(null)
    }
  }

  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-bold">
          <Clock className="size-5 text-primary" aria-hidden="true" />
          Günlük zaman bütçesi
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          {budget?.question ?? 'Günlük zaman bütçesi bilgilerin yükleniyor…'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {loadError ? (
          <ApiErrorAlert error={loadError} title="Zaman bütçesi yüklenemedi" onRetry={retry} />
        ) : !budget ? (
          <div
            role="status"
            aria-label="Günlük zaman bütçesi yükleniyor"
            className="grid gap-3 sm:grid-cols-3"
          >
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <RadioGroup
              value={budget.selectedOptionCode ?? ''}
              onValueChange={handleChange}
              disabled={pendingOptionCode !== null}
              aria-label={budget.question}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {budget.options.map((option) => {
                const itemId = `time-budget-${option.code}`
                const pending = pendingOptionCode === option.code

                return (
                  <label
                    key={option.code}
                    htmlFor={itemId}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors',
                      'hover:border-primary/40 hover:bg-primary-soft/40',
                      'has-data-checked:border-primary has-data-checked:bg-primary-soft',
                      'has-focus-visible:border-primary',
                      pendingOptionCode && 'cursor-wait opacity-70',
                    )}
                  >
                    <RadioGroupItem id={itemId} value={option.code} className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold leading-snug text-foreground">
                        {option.label}
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {pending ? 'Kaydediliyor…' : `${option.minutes} dakika`}
                      </span>
                    </span>
                  </label>
                )
              })}
            </RadioGroup>

            {updateError ? (
              <ApiErrorAlert error={updateError} title="Zaman bütçesi güncellenemedi" />
            ) : null}

            {saved ? (
              <Alert className="border-primary/30 bg-primary-soft text-primary">
                <CheckCircle2 aria-hidden="true" />
                <AlertTitle>Günlük zaman bütçen güncellendi.</AlertTitle>
              </Alert>
            ) : null}

            <FieldDescription>
              Bu tercih ebeveyn hesabına bağlıdır ve tüm çocukların önerilerinde kullanılır.
            </FieldDescription>
          </>
        )}
      </CardContent>
    </Card>
  )
}
