'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import type { ChildProfileSummary } from '@/lib/types/profile'
import { cn } from '@/lib/utils'

interface ChildSwitcherProps {
  items: ChildProfileSummary[]
  activeChildId: string
  onSelect: (childId: string) => void
}

/**
 * Yatay çocuk seçici. Mobilde kaydırılabilir, klavyeyle gezilebilir.
 * "Çocuk Ekle" mevcut onboarding başlangıcına yönlendirir.
 */
export function ChildSwitcher({ items, activeChildId, onSelect }: ChildSwitcherProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Çocuk seç"
      className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {items.map((child) => {
        const selected = child.childId === activeChildId

        return (
          <button
            key={child.childId}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(child.childId)}
            className={cn(
              'flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-2xl border bg-card py-2.5 pr-4 pl-2.5 text-left transition-colors',
              'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              selected
                ? 'border-primary bg-primary-soft shadow-soft'
                : 'border-border hover:border-primary/40 hover:bg-primary-soft/40',
            )}
          >
            <ProfileAvatar name={child.name} src={child.avatarUrl} className="size-10" />
            <span className="flex flex-col">
              <span className="font-semibold leading-snug text-foreground">{child.name}</span>
              {child.ageLabel ? (
                <span className="text-xs leading-snug text-muted-foreground">
                  {child.ageLabel}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}

      {/* Mevcut onboarding akışının başlangıcı; akış değiştirilmedi. */}
      <Link
        href="/onboarding/identity"
        className="flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-2xl border border-dashed border-input px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary-soft/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Plus className="size-4" aria-hidden="true" />
        Çocuk ekle
      </Link>
    </div>
  )
}
