export const PASSWORD_MIN_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value: string): string | null {
  const email = value.trim()
  if (!email) return 'E-posta adresi gerekli.'
  if (!EMAIL_PATTERN.test(email)) return 'Geçerli bir e-posta adresi gir.'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Şifre gerekli.'
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalı.`
  }
  return null
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Şifreyi tekrar gir.'
  if (password !== confirm) return 'Şifreler birbiriyle aynı değil.'
  return null
}

export function validateRequiredName(value: string): string | null {
  if (!value.trim()) return 'Adını yazman gerekiyor.'
  if (value.trim().length < 2) return 'Ad en az 2 karakter olmalı.'
  return null
}
