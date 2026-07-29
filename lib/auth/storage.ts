import type { AuthSession, UserRole } from '@/lib/types/auth'

const SESSION_KEY = 'kidloop.auth.session'
const CHILD_KEY = 'kidloop.onboarding.child'

const ROLES: UserRole[] = ['PARENT', 'WORKSHOP', 'ADMIN']

function isBrowser() {
  return typeof window !== 'undefined'
}

/**
 * "Beni hatırla" seçiliyse oturum localStorage'da kalıcı tutulur,
 * seçili değilse sessionStorage'a yazılır ve sekme kapanınca silinir.
 */
function stores(): Storage[] {
  if (!isBrowser()) return []
  try {
    return [window.localStorage, window.sessionStorage]
  } catch {
    return []
  }
}

export function readSession(): AuthSession | null {
  if (!isBrowser()) return null
  try {
    const raw =
      window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (typeof parsed?.token !== 'string' || parsed.token.length === 0) return null
    const role = ROLES.includes(parsed.role as UserRole) ? (parsed.role as UserRole) : 'PARENT'
    return {
      token: parsed.token,
      role,
      userId: typeof parsed.userId === 'number' ? parsed.userId : 0,
      emailVerified: Boolean(parsed.emailVerified),
    }
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession, remember = true) {
  if (!isBrowser()) return
  try {
    const target = remember ? window.localStorage : window.sessionStorage
    const other = remember ? window.sessionStorage : window.localStorage
    other.removeItem(SESSION_KEY)
    target.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* kota/gizli mod hatalarını yoksay */
  }
}

export function clearSession() {
  for (const store of stores()) {
    try {
      store.removeItem(SESSION_KEY)
      store.removeItem(CHILD_KEY)
    } catch {
      /* yoksay */
    }
  }
}

export function getStoredToken(): string | null {
  return readSession()?.token ?? null
}

/** Onboarding sırasında aktif çocuk bilgisi (V2'de backend'den gelecek). */
export interface StoredChild {
  childId: string
  childName?: string | null
}

export function readActiveChild(): StoredChild | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(CHILD_KEY) ?? window.sessionStorage.getItem(CHILD_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredChild>
    if (!parsed?.childId) return null
    return { childId: String(parsed.childId), childName: parsed.childName ?? null }
  } catch {
    return null
  }
}

export function writeActiveChild(child: StoredChild) {
  if (!isBrowser()) return
  try {
    // Çocuk bilgisi, oturumun tutulduğu depoya yazılır.
    const target = window.localStorage.getItem(SESSION_KEY)
      ? window.localStorage
      : window.sessionStorage
    target.setItem(CHILD_KEY, JSON.stringify(child))
  } catch {
    /* yoksay */
  }
}
