import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { PlanReadyView } from '@/components/plan/plan-ready-view'

export const metadata: Metadata = {
  title: 'Bugünün planı',
  description: 'Çocuğun için önerilen günlük etkinlik planı.',
}

export default function PlanReadyPage() {
  return (
    <ProtectedRoute>
      <AppShell width="wide">
        <PlanReadyView />
      </AppShell>
    </ProtectedRoute>
  )
}
