'use client'

import { useState } from 'react'
import { NewUserWelcome } from '@/components/home/new-user-welcome'
import { ReturningUserWelcome } from '@/components/home/returning-user-welcome'
import { useAuth } from '@/lib/auth/auth-context'
import { MOCK_HOME_STATE, MOCK_LAST_ACTIVITY } from '@/lib/mock/home'
import type { HomeState } from '@/lib/types/home'
import { cn } from '@/lib/utils'

export function HomeView() {
  const { activeChild } = useAuth()
  const childName = activeChild?.childName?.trim() || null

  // TODO(backend): Onboarding durumu API'den okunacak; başlangıç değeri
  // lib/mock/home.ts içindeki MOCK_HOME_STATE'ten gelir.
  const [homeState, setHomeState] = useState<HomeState>(MOCK_HOME_STATE)

  return (
    <div className="flex flex-col gap-8">
      {homeState === 'new-user' ? (
        <NewUserWelcome />
      ) : (
        <ReturningUserWelcome
          activity={MOCK_LAST_ACTIVITY}
          childId={activeChild?.childId}
          childName={childName}
        />
      )}

      {process.env.NODE_ENV === 'development' ? (
        <StatePreviewSwitch value={homeState} onChange={setHomeState} />
      ) : null}
    </div>
  )
}

/** Yalnızca geliştirme ortamında görünen önizleme anahtarı. */
function StatePreviewSwitch({
  value,
  onChange,
}: {
  value: HomeState
  onChange: (next: HomeState) => void
}) {
  const options: { value: HomeState; label: string }[] = [
    { value: 'new-user', label: 'Yeni kullanıcı' },
    { value: 'returning-user', label: 'Dönen kullanıcı' },
  ]

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border border-dashed pt-4">
      <span className="text-xs text-muted-foreground/70">dev önizleme:</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            value === option.value
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground/70 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
