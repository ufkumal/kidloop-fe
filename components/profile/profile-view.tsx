'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Baby, UserRound } from 'lucide-react'
import { ChildProfileTab } from '@/components/profile/child-profile-tab'
import { ParentProfileTab } from '@/components/profile/parent-profile-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MOCK_CHILDREN,
  MOCK_CONSENTS,
  MOCK_CONSENTS_STATUS,
  MOCK_PARENT,
  MOCK_TIME_BUDGET,
} from '@/lib/mock/profile'

type ProfileTab = 'child' | 'parent'

/**
 * Profil merkezi. Veri şu an lib/mock/profile.ts içindeki geçici örnek
 * veriden gelir; sekme durumu yalnızca yerel UI state'te tutulur.
 */
export function ProfileView() {
  const [tab, setTab] = useState<ProfileTab>('child')

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
          <ChildProfileTab childProfiles={MOCK_CHILDREN} />
        </TabsContent>

        <TabsContent value="parent" className="pt-4">
          <ParentProfileTab
            parent={MOCK_PARENT}
            timeBudget={MOCK_TIME_BUDGET}
            consents={MOCK_CONSENTS}
            consentsStatus={MOCK_CONSENTS_STATUS}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
