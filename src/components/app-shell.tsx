'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Clock, ListChecks, Lock, Plus, SlidersHorizontal } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Logo } from '@/components/logo'
import { MonthProvider, useMonth } from '@/components/month-context'
import { ModalsProvider, useModals } from '@/components/modals/modals-provider'
import { ToastProvider } from '@/components/toast'
import { currentMonthKey, isEditable, monthName, monthYear } from '@/lib/months'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/overview', label: 'Overview', Icon: Clock },
  { href: '/plan', label: 'Plan', Icon: ListChecks },
] as const

const tabs = [...nav, { href: '/settings', label: 'Settings', Icon: SlidersHorizontal }] as const

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MonthProvider>
      <ToastProvider>
        <ModalsProvider>
          <Shell>{children}</Shell>
        </ModalsProvider>
      </ToastProvider>
    </MonthProvider>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '/'
  const { user } = useUser()
  const me = useQuery(api.users.me)
  const displayName = me?.name || user?.firstName || user?.fullName || 'Account'
  const isActive = (href: string) => path === href || path.startsWith(href + '/')

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--side)] lg:flex-row">
      <aside className="sticky top-0 hidden h-screen w-[14.7rem] shrink-0 flex-col justify-between py-5 pl-5 lg:flex">
        <div className="flex min-h-0 flex-1 flex-col">
          <Logo />
          <nav className="flex flex-col gap-1.5">
            {nav.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex h-[2.36rem] items-center gap-3 rounded-[var(--radius-2)] px-3 text-[0.9375rem] transition-colors duration-[120ms]',
                  isActive(href)
                    ? 'bg-[var(--p-06)] font-medium text-[var(--text)]'
                    : 'text-[var(--text)] hover:bg-[var(--p-04)]',
                )}
              >
                <Icon
                  className={cn(
                    'size-[1.18rem]',
                    isActive(href) ? 'text-[var(--text)]' : 'text-[var(--muted-foreground)]',
                  )}
                />
                {label}
              </Link>
            ))}
          </nav>
          <MonthsNav />
        </div>
        <div className="mt-3 flex h-8 shrink-0 items-center justify-between gap-2 px-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-[1.4rem]' } }} />
            <span className="truncate text-sm text-[var(--text)]">{displayName}</span>
          </div>
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              'grid size-7 shrink-0 place-items-center rounded-[var(--radius-2)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]',
              isActive('/settings') ? 'text-[var(--text)]' : 'text-[var(--muted-foreground)]',
            )}
          >
            <SlidersHorizontal className="size-4" />
          </Link>
        </div>
      </aside>

      <main className="@container/main min-w-0 flex-1 bg-background pb-[5.5rem] lg:m-5 lg:rounded-[var(--radius-5)] lg:pb-0 lg:shadow-[inset_0_0_0_1px_var(--line)]">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="fixed right-0 bottom-0 left-0 z-40 flex h-[4.75rem] border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.875rem)] backdrop-blur-xl backdrop-saturate-[1.8] lg:hidden"
      >
        {tabs.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-5)] text-[0.6875rem] font-semibold transition-colors duration-[120ms]',
              isActive(href) ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)]',
            )}
          >
            <Icon className="size-[1.4rem]" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function MonthsNav() {
  const months = useQuery(api.months.listForUser) ?? []
  const { monthKey, setMonthKey } = useMonth()
  const { startMonth } = useModals()
  const [showAll, setShowAll] = useState(false)
  const today = currentMonthKey()
  const shown = showAll ? months : months.slice(0, 5)

  return (
    <div className="mt-6 flex min-h-0 flex-col">
      <div className="mb-1 flex h-7 items-center justify-between pl-3.5 text-[0.9375rem] text-[var(--muted-foreground)]">
        <span>Months</span>
        <button
          aria-label="Start a new month"
          onClick={() => startMonth()}
          className="grid size-7 place-items-center rounded-[var(--radius-2)] transition-colors duration-[120ms] hover:bg-[var(--p-06)] hover:text-[var(--text)]"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <ul className="flex min-h-0 flex-col overflow-y-auto">
        {shown.map((m) => {
          const active = m.key === monthKey
          const locked = !isEditable(m.key, today)
          const future = m.key > today
          return (
            <li key={m.key}>
              <button
                onClick={() => setMonthKey(m.key)}
                aria-current={active ? 'true' : undefined}
                className="flex h-10 w-full items-center gap-2.5 rounded-[var(--radius-2)] px-3 text-left text-[0.9375rem] transition-colors duration-[120ms] hover:bg-[var(--p-04)]"
              >
                <span
                  className={cn(
                    'size-[0.59rem] shrink-0 rounded-full',
                    active
                      ? 'bg-[var(--brand-primary)]'
                      : future
                        ? 'border border-[var(--p-60)]'
                        : 'bg-[var(--p-16)]',
                  )}
                />
                <span className={cn('flex-1', active ? 'font-semibold text-[var(--text)]' : 'text-[var(--text)]')}>
                  {monthName(m.key)}{' '}
                  <span className="text-[0.8125rem] text-[var(--muted-foreground)]">{monthYear(m.key)}</span>
                </span>
                {locked && <Lock aria-label="Locked" className="size-3 text-[var(--muted-foreground)]" />}
              </button>
            </li>
          )
        })}
      </ul>
      {months.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-1 h-8 rounded-[var(--radius-2)] px-3 text-left text-sm text-[var(--muted-foreground)] transition-colors duration-[120ms] hover:bg-[var(--p-04)] hover:text-[var(--text)]"
        >
          {showAll ? 'Show less' : 'Show all months'}
        </button>
      )}
    </div>
  )
}
