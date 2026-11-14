'use client'

import { useState } from 'react'
import Link from 'next/link'
import { krw } from '@/lib/format'
import { currentMonthKey, daysInMonth, monthName } from '@/lib/months'
import { RollingDigits } from '@/components/motion/rolling-digits'
import { useModals } from '@/components/modals/modals-provider'
import { cn } from '@/lib/utils'

type Props = {
  monthKey: string
  free: number
  income: number
  reserved: number
  missingCount: number
  paid: number
  payable: number
}

const softBand = (v: number) => Math.round(v / 100) * 100

export function HeroCard({ monthKey, free, income, reserved, missingCount, paid, payable }: Props) {
  const [view, setView] = useState<'month' | 'week'>('month')
  const { openIncome } = useModals()
  const today = currentMonthKey()
  const past = monthKey < today
  const future = monthKey > today
  const dim = daysInMonth(monthKey)
  const dayOfMonth = new Date().getDate()
  const daysLeft = Math.max(0, dim - dayOfMonth)
  const weeks = past ? Math.max(1, Math.round(dim / 7)) : Math.max(1, Math.ceil(daysLeft / 7))
  const neg = free < 0
  // Exact early in the cycle or while the plan is incomplete; softened to the nearest 100 otherwise.
  const exact = past || future || dayOfMonth <= 2 || missingCount > 0 || neg
  const value = view === 'week' ? free / weeks : exact ? free : softBand(free)
  const name = monthName(monthKey)

  const eyebrow = past ? 'Left over' : 'Left to spend'
  const sub = neg
    ? 'Your plan needs more than your salary'
    : past
      ? view === 'week'
        ? `a week, ${name} had ${weeks} weeks`
        : `${name} is closed`
      : future
        ? `for ${name}, not started yet`
        : view === 'week'
          ? `a week, for the next ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
          : `for the next ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`

  return (
    <section className="flex flex-col items-center rounded-[var(--radius-4)] bg-[var(--hero-bg)] px-7 pt-9 pb-6 text-center">
      <div className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
        {eyebrow}
      </div>
      <div
        className={cn(
          'mt-1.5 text-[clamp(2.875rem,4.4vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.025em] whitespace-nowrap tabular-nums',
          neg ? 'text-[var(--warn)]' : 'text-[var(--text)]',
        )}
      >
        <RollingDigits value={krw(Math.round(value))} />
      </div>
      <div className="mt-0.5 mb-4 text-[0.84rem] leading-snug text-[var(--muted-foreground)]">{sub}</div>

      <div role="tablist" aria-label="Show amount per" className="mb-7 inline-flex rounded-[7px] bg-[var(--p-06)] p-[3px]">
        {(['month', 'week'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={view === k}
            onClick={() => setView(k)}
            className={cn(
              'h-7 min-w-[4.5rem] rounded-[var(--radius-2)] px-3 text-sm capitalize transition-colors duration-[120ms]',
              view === k
                ? 'bg-card font-medium text-[var(--text)] shadow-[0_1px_3px_rgba(0,0,0,.08),0_0_0_1px_var(--p-10)]'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-4 border-t border-[var(--line)] pt-5 text-left">
        <button onClick={openIncome} aria-label={`Salary ${krw(income)}. Change.`} className="group min-w-0 text-left">
          <Label>Salary</Label>
          <Value underline>{krw(income)}</Value>
        </button>
        <div className="min-w-0">
          <Label>Reserved</Label>
          <Value>{krw(reserved)}</Value>
        </div>
        {missingCount > 0 ? (
          <Link href="/plan" className="group min-w-0">
            <Label>To fill in</Label>
            <Value underline tone="attn">
              {missingCount} {missingCount === 1 ? 'amount' : 'amounts'}
            </Value>
          </Link>
        ) : (
          <Link href="/plan" className="group min-w-0">
            <Label>Paid</Label>
            <Value underline tone={paid === payable && payable > 0 ? 'done' : undefined}>
              {paid} of {payable}
            </Value>
          </Link>
        )}
      </div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
      {children}
    </span>
  )
}

function Value({
  children,
  underline,
  tone,
}: {
  children: React.ReactNode
  underline?: boolean
  tone?: 'attn' | 'done'
}) {
  return (
    <b
      className={cn(
        'block text-base font-semibold whitespace-nowrap tabular-nums',
        tone === 'attn' ? 'text-[var(--amber)]' : tone === 'done' ? 'text-[var(--ok)]' : 'text-[var(--text)]',
        underline &&
          'underline decoration-[var(--p-16)] decoration-1 underline-offset-4 transition-[text-decoration-color] duration-[120ms] group-hover:decoration-[var(--brand-primary)]',
      )}
    >
      {children}
    </b>
  )
}
