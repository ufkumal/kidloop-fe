import { ApiError, apiRequest } from '@/lib/api/client'
import type { Consent, ConsentDecision } from '@/lib/types/consent'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeConsent(value: unknown): Consent | null {
  if (!isRecord(value)) return null
  const consentId = value.consentId
  const type = value.type
  const version = value.version
  const title = value.title
  const summary = value.summary
  const content = value.content
  const effectiveAt = value.effectiveAt

  if (
    typeof consentId !== 'number' ||
    !Number.isFinite(consentId) ||
    typeof type !== 'string' ||
    typeof version !== 'string' ||
    typeof title !== 'string' ||
    typeof summary !== 'string' ||
    typeof content !== 'string' ||
    typeof effectiveAt !== 'string' ||
    typeof value.required !== 'boolean' ||
    (typeof value.granted !== 'boolean' && value.granted !== null)
  ) {
    return null
  }

  return {
    consentId,
    type,
    version,
    title,
    summary,
    content,
    effectiveAt,
    required: value.required,
    granted: value.granted,
    respondedAt: typeof value.respondedAt === 'string' ? value.respondedAt : null,
  }
}

export async function fetchConsents(signal?: AbortSignal): Promise<Consent[]> {
  const response = await apiRequest<unknown>('/api/consents', { auth: true, signal })
  if (!Array.isArray(response)) {
    throw new ApiError('İzinler alınamadı. Lütfen tekrar dene.', 502, response)
  }

  const consents = response.map(normalizeConsent)
  if (consents.some((consent) => consent === null)) {
    throw new ApiError('İzin bilgileri eksik geldi. Lütfen tekrar dene.', 502, response)
  }
  return consents as Consent[]
}

export async function updateConsent(
  consentId: number,
  decision: ConsentDecision,
): Promise<Consent> {
  const response = await apiRequest<unknown>(`/api/consents/${encodeURIComponent(consentId)}`, {
    method: 'PUT',
    auth: true,
    body: decision,
  })
  const consent = normalizeConsent(response)
  if (!consent) {
    throw new ApiError('İzin güncellendi ancak sunucu yanıtı eksik geldi.', 502, response)
  }
  return consent
}
