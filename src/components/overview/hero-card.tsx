'use client'

import { useState } from 'react'
import Link from 'next/link'
import { krw } from '@/lib/format'
import { daysLeftInPeriod, daysUntilStart, periodDays, periodOf, periodRange, shortDate } from '@/lib/months'
import { useMonth } from '@/components/month-context'
import { RollingDigits } from '@/components/motion/rolling-digits'
import { useModals } from '@/components/modals/modals-provider'
import { cn } from '@/lib/utils'
import { Segmented } from '@/components/ui/segmented'

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
  const { todayKey, payday, editable } = useMonth()
  const past = monthKey < todayKey
  const future = monthKey > todayKey
  const range = periodRange(monthKey, payday)
  const nextPayday = shortDate(new Date(periodOf(monthKey, payday).end.getTime() + 86_400_000))
  const daysLeft = daysLeftInPeriod(monthKey, payday)
  const startsIn = daysUntilStart(monthKey, payday)
  // A running budget divides by the weeks left until payday; others by their full length.
  const weeks = Math.max(1, past || future ? Math.round(periodDays(monthKey, payday) / 7) : Math.ceil(daysLeft / 7))
  const dayInPeriod = periodDays(monthKey, payday) - daysLeft + 1
  const neg = free < 0
  // Exact early in the cycle or while the plan is incomplete; softened to the nearest 100 otherwise.
  const exact = past || future || dayInPeriod <= 2 || missingCount > 0 || neg
  const value = view === 'week' ? free / weeks : exact ? free : softBand(free)
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

  const eyebrow = past ? 'Left over' : 'Left to spend'
  const sub = neg
    ? 'Your plan needs more than your salary'
    : past
      ? view === 'week'
        ? `a week, over the ${plural(weeks, 'week')} of ${range}`
        : `${range}, now ended`
      : future
        ? view === 'week'
          ? `a week, over the ${plural(weeks, 'week')} of ${range}`
          : `for ${range}. Starts on payday${startsIn > 0 ? `, in ${plural(startsIn, 'day')}` : ''}`
        : view === 'week'
          ? `a week, for the ${plural(weeks, 'week')} until payday`
          : `until payday on ${nextPayday}, ${plural(daysLeft, 'day')} left`

  return (
    <section className="flex flex-col items-center rounded-[var(--radius-4)] bg-[var(--hero-bg)] px-7 pt-9 pb-6 text-center">
      <div className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
        {eyebrow}
      </div>
      <div
        className={cn(
          'mt-1.5 text-[clamp(2.875rem,4.4vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.03em] whitespace-nowrap tabular-nums',
          neg ? 'text-[var(--warn)]' : 'text-[var(--text)]',
        )}
      >
        <RollingDigits value={krw(Math.round(value))} />
      </div>
      <div className="mt-0.5 mb-4 text-[0.84rem] leading-snug text-[var(--muted-foreground)]">{sub}</div>

      <Segmented
        label="Show amount per"
        className="mb-7"
        segmentClassName="min-w-[4.5rem] capitalize"
        value={view}
        onChange={setView}
        options={[
          { value: 'month', label: 'Month' },
          { value: 'week', label: 'Week' },
        ]}
      />

      <div className="grid w-full grid-cols-3 gap-4 border-t border-[var(--line)] pt-5 text-left">
        <button
          onClick={openIncome}
          disabled={!editable}
          aria-label={editable ? `Salary ${krw(income)}. Change.` : `Salary ${krw(income)}`}
          data-press="none"
          className="group min-w-0 text-left disabled:cursor-default"
        >
          <Label>Salary</Label>
          <Value underline={editable}>{krw(income)}</Value>
        </button>
        <div className="min-w-0">
          <Label>{past ? 'Spent' : 'Planned'}</Label>
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
