import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { SelectedActivityView } from '@/components/plan/selected-activity-view'

export const metadata: Metadata = {
  title: 'Etkinlik seçildi',
  description: 'Seçtiğiniz Kidloop etkinliği için oyun zamanı.',
}

export default function ActivitySelectedPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <SelectedActivityView />
      </AppShell>
    </ProtectedRoute>
  )
}
