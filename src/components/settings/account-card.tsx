'use client'

import { SignOutButton, useUser } from '@clerk/nextjs'
import { SectionCard } from './section-card'

export function AccountCard() {
  const { user } = useUser()
  return (
    <SectionCard title="Account">
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--text)]">
          {user?.fullName ?? user?.firstName ?? '—'}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
      </div>
      <SignOutButton>
        <button className="h-9 self-start rounded-[var(--radius-3)] border border-[var(--line)] px-4 text-sm text-[var(--text)] hover:bg-[var(--p-04)]">
          Sign out
        </button>
      </SignOutButton>
    </SectionCard>
  )
}
