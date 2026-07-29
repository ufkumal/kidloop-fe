'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'

interface ApiErrorAlertProps {
  error: unknown
  title?: string
  onRetry?: () => void
  retryLabel?: string
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.'
}

export function ApiErrorAlert({
  error,
  title = 'Bir sorun oluştu',
  onRetry,
  retryLabel = 'Tekrar dene',
}: ApiErrorAlertProps) {
  if (!error) return null

  return (
    <Alert
      variant="destructive"
      className="rounded-2xl border-destructive/25 bg-destructive/5 px-4 py-3"
    >
      <AlertTriangle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{toErrorMessage(error)}</AlertDescription>
      {onRetry ? (
        <AlertAction>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw data-icon="inline-start" />
            {retryLabel}
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  )
}
