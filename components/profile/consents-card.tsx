'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, FileText, ShieldCheck } from 'lucide-react'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { fetchConsents, updateConsent } from '@/lib/api/consents'
import type { Consent } from '@/lib/types/consent'
import { cn } from '@/lib/utils'

function readableConsentContent(content: string): string {
  return content.replace(/^#{1,6}\s+/gm, '').trim()
}

export function ConsentsCard() {
  const [consents, setConsents] = useState<Consent[] | null>(null)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [updateError, setUpdateError] = useState<unknown>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<Consent | null>(null)
  const [openTextId, setOpenTextId] = useState<number | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setLoadError(null)
    setConsents(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchConsents(controller.signal)
      .then(setConsents)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setLoadError(requestError)
      })
    return () => controller.abort()
  }, [requestVersion])

  async function saveDecision(consent: Consent, granted: boolean) {
    if (updatingId !== null || consent.granted === granted) return

    setUpdateError(null)
    setUpdatingId(consent.consentId)
    setConsents((current) =>
      current?.map((item) =>
        item.consentId === consent.consentId ? { ...item, granted } : item,
      ) ?? null,
    )

    try {
      const updated = await updateConsent(consent.consentId, { granted })
      setConsents((current) =>
        current?.map((item) => (item.consentId === updated.consentId ? updated : item)) ?? null,
      )
    } catch (requestError) {
      setConsents((current) =>
        current?.map((item) => (item.consentId === consent.consentId ? consent : item)) ?? null,
      )
      setUpdateError(requestError)
    } finally {
      setUpdatingId(null)
    }
  }

  function handleToggle(consent: Consent, granted: boolean) {
    if (consent.required && !granted) {
      setPendingRevoke(consent)
      return
    }
    void saveDecision(consent, granted)
  }

  function confirmRevoke() {
    if (!pendingRevoke) return
    const consent = pendingRevoke
    setPendingRevoke(null)
    void saveDecision(consent, false)
  }

  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-bold">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          İzinler ve onaylar
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          Onay durumunu buradan görebilir, tercihlerini güncelleyebilirsin.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {loadError ? (
          <ApiErrorAlert error={loadError} title="İzinler yüklenemedi" onRetry={retry} />
        ) : consents === null ? (
          <ul role="status" aria-label="İzinler yükleniyor" className="flex flex-col gap-3">
            {[0, 1, 2].map((index) => (
              <li key={index} className="rounded-2xl border border-border p-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full max-w-sm" />
                </div>
              </li>
            ))}
          </ul>
        ) : consents.length === 0 ? (
          <Empty className="border border-dashed border-input bg-warm/40">
            <EmptyHeader>
              <EmptyTitle className="font-heading text-base font-bold">
                Gösterilecek izin yok
              </EmptyTitle>
              <EmptyDescription>
                Onay metinleri yayınlandığında bu listede görünecek.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {consents.map((consent) => {
              const granted = consent.granted === true
              const textOpen = openTextId === consent.consentId
              const updating = updatingId === consent.consentId

              return (
                <li
                  key={consent.consentId}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold leading-snug text-foreground">
                          {consent.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'h-auto py-1 text-[0.7rem] font-bold tracking-wide uppercase',
                            consent.required
                              ? 'bg-orange-soft text-orange'
                              : 'bg-primary-soft text-primary',
                          )}
                        >
                          {consent.required ? 'Zorunlu' : 'İsteğe bağlı'}
                        </Badge>
                      </div>

                      <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                        {consent.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span
                          className={cn(
                            'font-semibold',
                            granted ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {updating ? 'Kaydediliyor…' : granted ? 'Onaylandı' : 'Onaylanmadı'}
                        </span>
                        <span className="text-muted-foreground">Sürüm {consent.version}</span>
                        <button
                          type="button"
                          onClick={() => setOpenTextId(textOpen ? null : consent.consentId)}
                          aria-expanded={textOpen}
                          aria-controls={`consent-text-${consent.consentId}`}
                          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          <FileText className="size-4" aria-hidden="true" />
                          {textOpen ? 'Metni gizle' : 'Metni görüntüle'}
                        </button>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center">
                      <Switch
                        id={`consent-switch-${consent.consentId}`}
                        checked={granted}
                        disabled={updatingId !== null}
                        onCheckedChange={(next) => handleToggle(consent, next === true)}
                        aria-label={`${consent.title} iznini ${granted ? 'kapat' : 'aç'}`}
                        className="scale-125"
                      />
                    </div>
                  </div>

                  {textOpen ? (
                    <div
                      id={`consent-text-${consent.consentId}`}
                      className="border-t border-border bg-warm/40 px-4 py-4"
                    >
                      <p className="whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
                        {readableConsentContent(consent.content)}
                      </p>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        {updateError ? (
          <ApiErrorAlert error={updateError} title="İzin tercihi güncellenemedi" />
        ) : null}

        {consents && consents.length > 0 ? (
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Zorunlu izinleri kapatmak hesabını kullanmanı etkileyebilir. İsteğe bağlı izinleri
            istediğin zaman açıp kapatabilirsin.
          </p>
        ) : null}
      </CardContent>

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null)
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="rounded-2xl bg-orange-soft text-orange">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Bu izin zorunlu</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {pendingRevoke
                ? `“${pendingRevoke.title}” iznini kapatırsan Kidloop’u kullanmaya devam edemeyebilirsin. Devam etmek istediğine emin misin?`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-xl px-4">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11 rounded-xl px-4"
              onClick={confirmRevoke}
            >
              İzni kapat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
