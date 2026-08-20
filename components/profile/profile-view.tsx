'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Baby, UserRound } from 'lucide-react'
import { ChildProfileTab } from '@/components/profile/child-profile-tab'
import { ParentProfileTab } from '@/components/profile/parent-profile-tab'
import { ApiErrorAlert } from '@/components/common/api-error-alert'
import { LoadingState } from '@/components/common/loading-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchProfile } from '@/lib/api/profile'
import type { ProfileData } from '@/lib/types/profile'

type ProfileTab = 'child' | 'parent'

/** Profil ve çocuk verilerini backend'den yükleyen profil merkezi. */
export function ProfileView() {
  const [tab, setTab] = useState<ProfileTab>('child')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  const retry = useCallback(() => {
    setError(null)
    setProfile(null)
    setRequestVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchProfile(controller.signal)
      .then(setProfile)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError)
      })
    return () => controller.abort()
  }, [requestVersion])

  if (error) {
    return <ApiErrorAlert error={error} title="Profil yüklenemedi" onRetry={retry} />
  }

  if (!profile) {
    return <LoadingState label="Profilin hazırlanıyor…" />
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/home"
          className="inline-flex w-fit min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Ana sayfaya dön
        </Link>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Profil</h1>

        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Aile bilgilerini, çocuk profillerini ve tercihlerini buradan yönetebilirsin.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(value) => setTab(value as ProfileTab)}>
        <TabsList className="h-auto w-full gap-1 rounded-2xl bg-secondary p-1.5 sm:w-fit">
          <TabsTrigger
            value="child"
            className="h-11 flex-1 rounded-xl px-4 font-semibold data-active:bg-card data-active:text-primary sm:flex-none"
          >
            <Baby data-icon="inline-start" />
            Çocuk profili
          </TabsTrigger>
          <TabsTrigger
            value="parent"
            className="h-11 flex-1 rounded-xl px-4 font-semibold data-active:bg-card data-active:text-primary sm:flex-none"
          >
            <UserRound data-icon="inline-start" />
            Ebeveyn profili
          </TabsTrigger>
        </TabsList>

        <TabsContent value="child" className="pt-4">
          <ChildProfileTab childProfiles={profile.children} />
        </TabsContent>

        <TabsContent value="parent" className="pt-4">
          <ParentProfileTab parent={profile.parent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
