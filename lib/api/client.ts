import { getStoredToken } from '@/lib/auth/storage'

/**
 * Tarayıcı istekleri same-origin proxy üzerinden gider:
 * /api/backend/... -> Next.js route -> gerçek backend
 *
 * Bu yaklaşım CORS sorununu kaldırır ve şifre gibi alanların URL'ye
 * düşmesini engeller; backend adresi yalnızca sunucu tarafı route içinde okunur.
 */
export const API_BASE_URL = '/api/backend'

/** Token geçersizleştiğinde uygulamanın oturumu kapatması için yayınlanan olay */
export const UNAUTHORIZED_EVENT = 'kidloop:unauthorized'

/** Backend'in alan bazlı doğrulama hataları: { password: "size must be..." } */
export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown
  /** Varsa forma dağıtılabilecek alan bazlı hatalar */
  readonly fieldErrors?: FieldErrors

  constructor(message: string, status: number, details?: unknown, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.fieldErrors = fieldErrors
  }
}

/**
 * Backend doğrulama hatalarını okur. Desteklenen şekiller:
 * - { fieldErrors: { password: "..." } }
 * - { errors: { password: ["..."] } }
 */
function extractFieldErrors(payload: unknown): FieldErrors | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const record = payload as Record<string, unknown>

  const source = record.fieldErrors ?? record.errors
  if (!source || typeof source !== 'object' || Array.isArray(source)) return undefined

  const result: FieldErrors = {}
  for (const [field, value] of Object.entries(source as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) {
      result[field] = value.trim()
    } else if (Array.isArray(value)) {
      const first = value.find((item): item is string => typeof item === 'string' && !!item.trim())
      if (first) result[field] = first.trim()
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Sunucu mesajları çoğunlukla İngilizce ("Invalid token") geliyor.
 * Kullanıcıya ham İngilizce metin göstermemek için yalnızca Türkçe
 * görünen mesajları doğrudan kullanıyoruz.
 */
function looksTurkish(message: string): boolean {
  return /[çğıİöşüÇĞÖŞÜ]/.test(message)
}

/** Backend'in sık gönderdiği İngilizce mesajların Türkçe karşılıkları */
const SERVER_MESSAGE_TR: ReadonlyArray<[RegExp, string]> = [
  [/verify your email|email not verified/i, 'Giriş yapmadan önce e-postanı doğrulaman gerekiyor.'],
  [/invalid (or expired )?token|token (is )?expired/i, 'Bağlantının süresi dolmuş ya da geçersiz.'],
  [/bad credentials|invalid (email|credentials|password)/i, 'E-posta veya şifre hatalı.'],
  [/already (exists|registered|in use)|duplicate/i, 'Bu e-posta ile kayıtlı bir hesap zaten var.'],
  [/user not found|not found/i, 'Kayıt bulunamadı.'],
]

function translateServerMessage(message: string): string | null {
  for (const [pattern, turkish] of SERVER_MESSAGE_TR) {
    if (pattern.test(message)) return turkish
  }
  return null
}

function messageForStatus(status: number, payload: unknown, hasFieldErrors = false): string {
  // Alan bazlı hatalar forma dağıtıldığında, üstteki uyarı Türkçe ve genel kalsın.
  if (hasFieldErrors) return 'Bazı alanları kontrol etmen gerekiyor.'

  const fromPayload = extractMessage(payload)
  if (fromPayload && looksTurkish(fromPayload)) return fromPayload

  const translated = fromPayload ? translateServerMessage(fromPayload) : null
  if (translated) return translated

  if (status === 0) return 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.'
  if (status === 400) return 'Gönderilen bilgiler geçersiz. Lütfen kontrol edip tekrar dene.'
  if (status === 401) return 'Oturumun sona ermiş ya da bilgiler hatalı. Tekrar giriş yapman gerekiyor.'
  if (status === 403) return 'Bu işlem için yetkin bulunmuyor.'
  if (status === 404) return 'İstenen kayıt bulunamadı.'
  if (status === 409) return 'Bu kayıt zaten mevcut.'
  if (status === 422) return 'Bilgiler doğrulanamadı. Lütfen alanları kontrol et.'
  if (status >= 500) return 'Sunucuda beklenmeyen bir sorun oluştu. Kısa süre sonra tekrar dene.'
  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.'
}

function extractMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim().length > 0) return payload.trim()
  if (!payload || typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>
  for (const key of ['message', 'error', 'detail', 'title']) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }

  const errors = record.errors
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) => (typeof item === 'string' ? item : extractMessage(item)))
      .filter((item): item is string => Boolean(item))
    if (messages.length > 0) return messages.join(' ')
  }
  return null
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** true ise Authorization: Bearer <token> başlığı eklenir */
  auth?: boolean
  /** Belirtilirse depodaki token yerine bu token kullanılır */
  token?: string
  signal?: AbortSignal
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, auth = false, token, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const bearer = token ?? getStoredToken()
    if (!bearer) {
      throw new ApiError('Oturum bulunamadı. Lütfen tekrar giriş yap.', 401)
    }
    headers.Authorization = `Bearer ${bearer}`
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: 'no-store',
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(messageForStatus(0, null), 0, error)
  }

  const raw = await response.text()
  let payload: unknown = null
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = raw
    }
  }

  if (!response.ok) {
    const fieldErrors = extractFieldErrors(payload)

    // Kimlik doğrulamalı bir istek 401 dönerse token artık geçersizdir:
    // oturumu kapatıp girişe yönlendirmesi için uygulamaya haber verilir.
    if (auth && response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }

    throw new ApiError(
      messageForStatus(response.status, payload, Boolean(fieldErrors)),
      response.status,
      payload,
      fieldErrors,
    )
  }

  return payload as TResponse
}
