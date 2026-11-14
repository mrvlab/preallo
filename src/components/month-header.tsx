'use client'

import { useQuery } from 'convex/react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useMonth } from '@/components/month-context'
import { useModals } from '@/components/modals/modals-provider'
import { monthName, monthYear } from '@/lib/months'

export function MonthHeader() {
  const { monthKey, setMonthKey } = useMonth()
  const { openPicker, startMonth } = useModals()
  const months = useQuery(api.months.listForUser) ?? []
  const keys = months.map((m) => m.key).sort()
  const i = keys.indexOf(monthKey)

  return (
    <>
      <header className="hidden h-[4.875rem] items-center px-7 pt-1 lg:flex">
        <button
          aria-label="Choose or start a month"
          onClick={openPicker}
          className="grid size-[2.66rem] place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
        >
          <Plus className="size-[1.18rem]" />
        </button>
        <span className="mx-4 h-7 w-px bg-[var(--line)]" />
        <h1>
          <button
            onClick={openPicker}
            className="-mx-2 flex items-baseline gap-3 rounded-[var(--radius-3)] px-2 transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
          >
            <span className="text-[2.1rem] leading-tight font-bold tracking-[-0.03em] text-[var(--text)]">
              {monthName(monthKey)}
            </span>
            <span className="text-[1.25rem] font-medium text-[var(--muted-foreground)]">
              {monthYear(monthKey)}
            </span>
          </button>
        </h1>
      </header>

      <header className="flex items-center justify-between gap-2 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 lg:hidden">
        <div className="flex items-center gap-0.5">
          <IconBtn label="Previous month" disabled={i <= 0} onClick={() => setMonthKey(keys[i - 1])}>
            <ChevronLeft className="size-5" />
          </IconBtn>
          <h1>
            <button
              onClick={openPicker}
              className="-mx-2 block rounded-[var(--radius-3)] px-2 py-0.5 text-left transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
            >
              <span className="text-[1.375rem] leading-tight font-bold tracking-[-0.03em] text-[var(--text)]">
                {monthName(monthKey)}
              </span>
              <span className="ml-2 text-sm font-bold text-[var(--muted-foreground)]">{monthYear(monthKey)}</span>
            </button>
          </h1>
          <IconBtn
            label="Next month"
            disabled={i === -1 || i >= keys.length - 1}
            onClick={() => setMonthKey(keys[i + 1])}
          >
            <ChevronRight className="size-5" />
          </IconBtn>
        </div>
        <button
          aria-label="Start a new month"
          onClick={() => startMonth()}
          className="grid size-8 place-items-center rounded-[var(--radius-3)] bg-[var(--brand-primary)] text-[var(--primary-foreground)] transition-[filter] duration-[120ms] hover:brightness-110"
        >
          <Plus className="size-[1.125rem]" />
        </button>
      </header>
    </>
  )
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-[2.125rem] place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)] disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}
