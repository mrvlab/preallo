'use client'

import { useState } from 'react'
import { krw, daysLeftInMonth, weeksLeft } from '@/lib/format'
import { RollingDigits } from '@/components/motion/rolling-digits'
import { cn } from '@/lib/utils'

type Props = {
  free: number
  income: number
  reserved: number
  missingCount: number
  paid: number
  payable: number
}

function softBand(v: number) {
  return Math.round(v / 100) * 100
}

export function HeroCard({
  free,
  income,
  reserved,
  missingCount,
  paid,
  payable,
}: Props) {
  const [view, setView] = useState<'month' | 'week'>('month')
  const neg = free < 0
  const dl = daysLeftInMonth()
  const wl = weeksLeft()
  const today = new Date().getUTCDate()
  // Exact amount early in the cycle or when plan is incomplete, softened otherwise.
  const exact = today <= 2 || missingCount > 0 || neg
  const monthValue = exact ? free : softBand(free)
  const weekValue = wl > 0 ? free / wl : 0
  const value = view === 'month' ? monthValue : weekValue
  const sub =
    view === 'month'
      ? `for the next ${dl} ${dl === 1 ? 'day' : 'days'}`
      : `a week for the next ${wl} ${wl === 1 ? 'week' : 'weeks'}`

  return (
    <section className="flex flex-col items-center gap-0 rounded-[var(--radius-4)] bg-[var(--hero-bg)] px-7 pt-10 pb-6 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
        LEFT TO SPEND
      </div>
      <div
        className={cn(
          'mt-2 font-semibold leading-none tracking-[-0.03em] tabular-nums',
          neg ? 'text-[var(--warn)]' : 'text-[var(--text)]',
        )}
        style={{ fontSize: 56 }}
      >
        <RollingDigits value={krw(Math.round(value))} />
      </div>
      <div className="mt-3 text-sm text-[var(--muted-foreground)]">{sub}</div>

      <div className="mt-6 inline-flex rounded-[var(--radius-3)] bg-card p-[3px] ring-1 ring-[var(--p-16)]">
        {(['month', 'week'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={cn(
              'h-7 rounded-[4px] px-5 text-xs font-medium capitalize transition-colors duration-[120ms]',
              view === k
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mt-7 grid w-full grid-cols-3 gap-4 border-t border-[var(--line)] pt-5 text-left">
        <Stat label="SALARY" value={krw(income)} underline />
        <Stat label="RESERVED" value={krw(reserved)} />
        {missingCount > 0 ? (
          <Stat
            label="TO FILL IN"
            value={`${missingCount} amount${missingCount === 1 ? '' : 's'}`}
            underline
            tone="attn"
          />
        ) : (
          <Stat
            label="PAID"
            value={`${paid} of ${payable}`}
            underline={payable > 0}
            tone={paid === payable && payable > 0 ? 'done' : undefined}
          />
        )}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  underline,
  tone,
}: {
  label: string
  value: string
  underline?: boolean
  tone?: 'attn' | 'done'
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span
        className={cn(
          'text-[16px] font-semibold tabular-nums whitespace-nowrap',
          tone === 'attn'
            ? 'text-[var(--amber)]'
            : tone === 'done'
              ? 'text-[var(--ok)]'
              : 'text-[var(--text)]',
          underline &&
            'underline decoration-[var(--p-16)] decoration-1 underline-offset-[4px]',
        )}
      >
        {value}
      </span>
    </div>
  )
}
