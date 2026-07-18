import { redirect } from 'next/navigation'
import { MOCK_CHILD } from '@/lib/onboarding-data'

export default function HomePage() {
  redirect(`/onboarding/children/${MOCK_CHILD.id}/questions`)
}
