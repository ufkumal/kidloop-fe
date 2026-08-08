import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { HomeView } from '@/components/home/home-view'
import { AppShell } from '@/components/layout/app-shell'

export const metadata: Metadata = {
  title: 'Ana sayfa',
  description: 'Kidloop ana sayfası: etkinlik önerileri ve geri bildirim paylaşımı.',
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <HomeView />
      </AppShell>
    </ProtectedRoute>
  )
}
