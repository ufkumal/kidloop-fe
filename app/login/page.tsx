import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Giriş yap | Kidloop',
  description: 'Kidloop hesabına giriş yap ve çocuğuna uygun etkinlik önerilerine devam et.',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
