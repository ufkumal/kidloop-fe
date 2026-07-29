export type UserRole = 'PARENT' | 'WORKSHOP' | 'ADMIN'

/** POST /api/auth/register */
export interface RegisterRequest {
  email: string
  password: string
  role: 'PARENT'
}

/** POST /api/auth/login */
export interface LoginRequest {
  email: string
  password: string
  deviceLabel: string
}

/** POST /api/auth/login yanıtı */
export interface LoginResponse {
  token: string
  role: UserRole
  userId: number
  emailVerified: boolean
}

/** localStorage'da saklanan oturum bilgisi */
export interface AuthSession {
  token: string
  role: UserRole
  userId: number
  emailVerified: boolean
}
