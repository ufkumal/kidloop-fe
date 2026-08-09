import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { ProfileView } from '@/components/profile/profile-view'

export const metadata: Metadata = {
  title: 'Profil',
  description:
    'Kidloop profil merkezi: çocuk profilleri, tanıma soruları, ebeveyn bilgileri ve izinler.',
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ProfileView />
      </AppShell>
    </ProtectedRoute>
  )
}
