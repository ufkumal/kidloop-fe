'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ChevronDown, Pencil, ShieldCheck } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { SubmitButton } from '@/components/common/submit-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchConsents, updateConsent } from '@/lib/api/consents'
import { useAuth } from '@/lib/auth/auth-context'
import type { Consent } from '@/lib/types/consent'
import { cn } from '@/lib/utils'

function ConsentContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
      {blocks.map((block, index) => {
        const heading = block.match(/^#{1,6}\s+(.+)$/)
        if (heading) {
          return (
            <h3 key={index} className="font-heading text-base font-bold text-foreground">
              {heading[1]}
            </h3>
          )
        }
        return <p key={index}>{block.replace(/\n/g, ' ')}</p>
      })}
    </div>
  )
}

export function ConsentStep({ childId }: { childId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resolveHomeStatus } = useAuth()
  const [consents, setConsents] = useState<Consent[]>([])
  const [decisions, setDecisions] = useState<Record<number, boolean>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)

    fetchConsents(controller.signal)
      .then((items) => {
        setConsents(items)
        setDecisions(
          Object.fromEntries(items.map((consent) => [consent.consentId, consent.granted === true])),
        )
        const requestedConsentId = Number(searchParams.get('consentId'))
        const firstRequiredMissing = items.find(
          (consent) => consent.required && consent.granted !== true,
        )
        setExpandedId(
          Number.isFinite(requestedConsentId) &&
            items.some((consent) => consent.consentId === requestedConsentId)
            ? requestedConsentId
            : (firstRequiredMissing?.consentId ?? null),
        )
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setLoadError(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, searchParams])

  const retry = useCallback(() => setAttempt((current) => current + 1), [])
  const requiredComplete = useMemo(
    () =>
      consents
        .filter((consent) => consent.required)
        .every((consent) => decisions[consent.consentId]),
    [consents, decisions],
  )

  async function toggleConsent(consent: Consent, checked: boolean) {
    if (pending) return
    const previous = decisions[consent.consentId] === true
    setDecisions((current) => ({ ...current, [consent.consentId]: checked }))
    setExpandedId(consent.consentId)
    setSubmitError(null)
    setPending(true)
    try {
      await updateConsent(consent.consentId, { granted: checked })
    } catch (cause) {
      setDecisions((current) => ({ ...current, [consent.consentId]: previous }))
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  async function handleComplete() {
    if (!requiredComplete) return
    setSubmitError(null)
    setPending(true)

    try {
      const resolution = await resolveHomeStatus()
      if (
        resolution.status.state === 'half-onboarding-user' &&
        resolution.status.onboardingStep === 'CONSENTS'
      ) {
        setAttempt((current) => current + 1)
      }
      if (
        resolution.status.state === 'returning-user' &&
        resolution.status.shouldGenerateDailyPlan
      ) {
        router.replace('/plan-ready')
      } else {
        router.replace(resolution.path)
      }
    } catch (cause) {
      setSubmitError(cause)
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-card ring-border">
        <CardContent>
          <LoadingState label="İzinler yükleniyor…" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return <ApiErrorAlert error={loadError} title="İzinler yüklenemedi" onRetry={retry} />
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary"
        >
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">Son bir adım: izinler</h1>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Planını hazırlamadan önce aşağıdaki metinleri inceleyip tercihlerini belirt.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          nativeButton={false}
          render={
            <Link
              href={`/onboarding/${encodeURIComponent(childId)}/identity?returnTo=${encodeURIComponent(`/onboarding/${childId}/consents`)}`}
            />
          }
        >
          <Pencil data-icon="inline-start" />
          Çocuk bilgilerini düzenle
        </Button>
      </header>

      <Card className="rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-bold">İzinler</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ul className="flex flex-col gap-3">
            {consents.map((consent) => {
              const expanded = expandedId === consent.consentId
              const checked = decisions[consent.consentId] === true

              return (
                <li
                  key={consent.consentId}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-card transition-colors',
                    expanded ? 'border-primary/60' : 'border-border',
                  )}
                >
                  <div className="flex items-start gap-3 px-4 py-4">
                    <Checkbox
                      id={`consent-${consent.consentId}`}
                      checked={checked}
                      disabled={pending}
                      onCheckedChange={(value) => void toggleConsent(consent, value === true)}
                      aria-label={`${consent.title} izni`}
                      className="mt-0.5 size-5"
                    />
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none"
                      onClick={() => setExpandedId(expanded ? null : consent.consentId)}
                      aria-expanded={expanded}
                      aria-controls={`consent-content-${consent.consentId}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-relaxed text-foreground">
                          {consent.title}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                          {consent.summary}
                        </span>
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'mt-0.5 h-auto py-1 font-bold tracking-wide uppercase',
                          consent.required
                            ? 'bg-orange-soft text-orange'
                            : 'bg-primary-soft text-primary',
                        )}
                      >
                        {consent.required ? 'Zorunlu' : 'İsteğe bağlı'}
                      </Badge>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'mt-1 size-4 shrink-0 text-muted-foreground transition-transform',
                          expanded && 'rotate-180',
                        )}
                      />
                    </button>
                  </div>

                  {expanded ? (
                    <div
                      id={`consent-content-${consent.consentId}`}
                      className="border-t border-border bg-warm/35 px-4 py-4 sm:pl-12"
                    >
                      <ConsentContent content={consent.content} />
                      <p className="mt-3 text-xs text-muted-foreground">
                        Sürüm {consent.version}
                      </p>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>

          <ApiErrorAlert error={submitError} title="İzinler kaydedilemedi" />

          <SubmitButton
            type="button"
            pending={pending}
            pendingLabel="İzinler kaydediliyor…"
            disabled={!requiredComplete}
            onClick={handleComplete}
          >
            Devam et
            <ArrowRight data-icon="inline-end" />
          </SubmitButton>

          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            {requiredComplete
              ? 'İsteğe bağlı izinler ilerlemeyi engellemez; tercihlerini daha sonra değiştirebilirsin.'
              : 'Devam etmek için zorunlu izinlerin tümünü onaylamalısın.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
