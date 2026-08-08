import { apiRequest } from '@/lib/api/client'
import type { Consent, ConsentDecision } from '@/lib/types/consent'

export async function fetchConsents(signal?: AbortSignal): Promise<Consent[]> {
  return apiRequest<Consent[]>('/api/consents', { auth: true, signal })
}

export async function updateConsent(
  consentId: number,
  decision: ConsentDecision,
): Promise<Consent> {
  return apiRequest<Consent>(`/api/consents/${encodeURIComponent(consentId)}`, {
    method: 'PUT',
    auth: true,
    body: decision,
  })
}
