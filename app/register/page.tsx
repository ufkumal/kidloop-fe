import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Kayıt ol | Kidloop',
  description: 'Kidloop hesabı oluştur ve çocuğuna uygun etkinlik önerilerini keşfet.',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
