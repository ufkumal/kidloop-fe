import { ApiError, apiRequest } from '@/lib/api/client'
import type { LoginRequest, LoginResponse, RegisterRequest, UserRole } from '@/lib/types/auth'

/**
 * Yalnızca backend sözleşmesinde tanımlı uçlar kullanılır:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - GET  /api/auth/verify?token=...
 */

export async function registerParent(input: { email: string; password: string }) {
  const body: RegisterRequest = {
    email: input.email.trim(),
    password: input.password,
    role: 'PARENT',
  }
  return apiRequest<unknown>('/api/auth/register', { method: 'POST', body })
}

export async function login(input: { email: string; password: string }) {
  const body: LoginRequest = {
    email: input.email.trim(),
    password: input.password,
    deviceLabel: 'Kidloop Web',
  }

  const raw = await apiRequest<Record<string, unknown>>('/api/auth/login', {
    method: 'POST',
    body,
  })

  const roles: UserRole[] = ['PARENT', 'WORKSHOP', 'ADMIN']
  const role = roles.includes(raw?.role as UserRole) ? (raw.role as UserRole) : 'PARENT'

  const session: LoginResponse = {
    token: String(raw?.token ?? ''),
    role,
    userId: Number(raw?.userId ?? 0),
    emailVerified: Boolean(raw?.emailVerified),
  }

  return session
}

/**
 * Backend, doğrulanmamış hesapta girişe 403 + "please verify your email" döner.
 * Bu durumu ham mesaj göstermek yerine ayrı bir ekranla karşılamak için ayırt ediyoruz.
 */
export function isEmailNotVerifiedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.status !== 403) return false
  // Mesaj Türkçeleştirildiği için hem çeviri hem ham sunucu metni kontrol edilir.
  const raw =
    typeof error.details === 'string' ? error.details : JSON.stringify(error.details ?? '')
  return /verify/i.test(raw) || /doğrula/i.test(error.message)
}

export async function verifyEmail(token: string, signal?: AbortSignal) {
  return apiRequest<unknown>(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    signal,
  })
}
