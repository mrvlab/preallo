'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Home, ListChecks, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navDesktop = [
  { href: '/overview', label: 'Overview' },
  { href: '/plan', label: 'Plan' },
] as const

const navMobile = [
  { href: '/overview', label: 'Overview', Icon: Home },
  { href: '/plan', label: 'Plan', Icon: ListChecks },
  { href: '/settings', label: 'Settings', Icon: Settings },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname()
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[var(--side)]">
      <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between bg-[var(--side)] px-5 py-6">
        <div>
          <Link
            href="/overview"
            className="block px-2 pb-6 font-semibold tracking-[0.18em] text-[var(--brand-primary)]"
            style={{ fontSize: 15 }}
          >
            PREALLO
          </Link>
          <nav className="flex flex-col gap-1">
            {navDesktop.map(({ href, label }) => {
              const active = path === href || path.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'h-9 rounded-[var(--radius-3)] px-3 text-sm leading-9 transition-colors duration-[120ms]',
                    active
                      ? 'bg-[var(--p-06)] text-[var(--brand-primary)] font-medium'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--p-04)]',
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-[var(--radius-3)] px-2 py-2 text-sm transition-colors duration-[120ms] hover:bg-[var(--p-04)]',
            path.startsWith('/settings') && 'bg-[var(--p-06)]',
          )}
        >
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: 'size-8' } }}
          />
          <span className="flex-1 truncate text-[var(--text)]">Account</span>
          <Settings
            size={16}
            className="text-[var(--muted-foreground)]"
          />
        </Link>
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
