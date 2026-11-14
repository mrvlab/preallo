'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  Clock,
  Home,
  ListChecks,
  Lock,
  Plus,
  Settings,
  Settings2,
} from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'

const navDesktop = [
  { href: '/overview', label: 'Overview', Icon: Clock },
  { href: '/plan', label: 'Plan', Icon: ListChecks },
] as const

const navMobile = [
  { href: '/overview', label: 'Overview', Icon: Home },
  { href: '/plan', label: 'Plan', Icon: ListChecks },
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? '/'
  const months = useQuery(api.months.listForUser) ?? []
  const current = currentMonthKey()
  const { user } = useUser()
  const displayName =
    user?.firstName ?? user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account'

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[var(--side)]">
      <aside className="hidden md:flex sticky top-0 h-screen w-[220px] shrink-0 flex-col justify-between bg-[var(--side)] px-4 py-6">
        <div className="flex flex-col gap-6">
          <Link
            href="/overview"
            className="block px-3 pb-2 font-semibold tracking-[0.18em] text-[var(--brand-primary)]"
            style={{ fontSize: 15 }}
          >
            PREALLO
          </Link>
          <nav className="flex flex-col gap-1">
            {navDesktop.map(({ href, label, Icon }) => {
              const active = path === href || path.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex h-9 items-center gap-3 rounded-[var(--radius-3)] px-3 text-sm transition-colors duration-[120ms]',
                    active
                      ? 'bg-[var(--p-06)] font-medium text-[var(--text)]'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--p-04)]',
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <MonthsNav months={months} current={current} />
        </div>
        <div className="flex items-center justify-between gap-2 px-1 pt-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: 'size-7' } }}
            />
            <span className="truncate text-sm text-[var(--text)]">
              {displayName}
            </span>
          </div>
          <Link
            href="/settings"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-3)] text-[var(--muted-foreground)] hover:bg-[var(--p-06)]"
            aria-label="Settings"
          >
            <Settings2 size={14} />
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-background pb-20 md:my-3 md:mr-3 md:rounded-[var(--radius-5)] md:border md:border-[var(--line)] md:pb-0">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] py-2 backdrop-blur md:hidden">
        {navMobile.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-16 flex-col items-center gap-0.5 rounded-[var(--radius-3)] px-3 py-1.5 text-xs transition-colors duration-[120ms]',
                active
                  ? 'text-[var(--brand-primary)]'
                  : 'text-[var(--muted-foreground)]',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function MonthsNav({
  months,
  current,
}: {
  months: Array<{ key: string; imported: boolean }>
  current: string
}) {
  const items = months.slice(0, 5)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
        <span>Months</span>
        <button
          aria-label="New month"
          className="flex h-5 w-5 items-center justify-center rounded text-[var(--muted-foreground)] hover:bg-[var(--p-06)] hover:text-[var(--text)]"
        >
          <Plus size={12} />
        </button>
      </div>
      <ul className="flex flex-col">
        {items.map((m) => {
          const [y, mm] = m.key.split('-')
          const active = m.key === current
          const past = m.key < current
          return (
            <li key={m.key}>
              <button className="flex w-full items-center gap-3 rounded-[var(--radius-3)] px-3 py-2 text-left text-sm transition-colors duration-[120ms] hover:bg-[var(--p-04)]">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    active
                      ? 'bg-[var(--brand-primary)]'
                      : past
                        ? 'bg-[var(--p-16)]'
                        : 'border border-[var(--p-16)]',
                  )}
                />
                <span
                  className={cn(
                    'flex-1',
                    active
                      ? 'font-medium text-[var(--text)]'
                      : 'text-[var(--muted-foreground)]',
                  )}
                >
                  {MONTHS_LONG[Number(mm) - 1]}{' '}
                  <span className="text-xs">{y}</span>
                </span>
                {past && (
                  <Lock
                    size={12}
                    className="text-[var(--muted-foreground)]"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
