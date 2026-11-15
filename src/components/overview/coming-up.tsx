'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import type { Id } from '../../../convex/_generated/dataModel'
import { krw } from '@/lib/format'
import { dateLabel, dueDate } from '@/lib/months'
import { useMonth } from '@/components/month-context'
import { RollingDigits } from '@/components/motion/rolling-digits'
import { useModals } from '@/components/modals/modals-provider'
import { cn } from '@/lib/utils'

type Item = {
  _id: Id<'items'> | Id<'transactions'>
  name: string
  amount?: number
  due?: number
  paid: boolean
  locked: boolean
  group?: string
  // Imported months carry the real payment date instead of a due day.
  date?: string
}

const SHOWN = 7

export function ComingUp({
  items,
  monthKey,
  readOnly,
}: {
  items: Item[]
  monthKey: string
  readOnly?: boolean
}) {
  const { openItem } = useModals()
  const { payday, todayKey } = useMonth()
  const on = (i: Item) => (i.date ? new Date(`${i.date}T00:00`) : dueDate(monthKey, i.due!, payday))
  const when = (i: Item) => on(i).getTime()
  const dated = items
    .filter((i) => (i.due || i.date) && (i.amount ?? 0) > 0)
    .sort((a, b) => when(a) - when(b))
  const pending = dated.filter((i) => !i.paid).reduce((a, i) => a + (i.amount ?? 0), 0)
  const now = new Date()
  // Ended budgets are entirely behind "today"; upcoming ones entirely ahead of it.
  const today =
    monthKey < todayKey
      ? Infinity
      : monthKey > todayKey
        ? -Infinity
        : new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const shown = dated.slice(0, SHOWN)
  const firstUpcoming = shown.findIndex((i) => when(i) >= today)
  const markerAt = firstUpcoming === -1 ? shown.length : firstUpcoming

  return (
    <section className="flex flex-col rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:px-7 lg:py-[1.65rem]">
      <span className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
        Coming up
      </span>
      <div className="mt-1 mb-[1.125rem] flex flex-wrap items-baseline gap-2">
        <b className="text-2xl font-bold tracking-[-0.02em] text-[var(--text)] tabular-nums">
          <RollingDigits value={krw(pending)} />
        </b>
        <span className="text-sm text-[var(--muted-foreground)]">still to leave your account</span>
      </div>

      {shown.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
          Give an item a payment date and it shows here.
        </p>
      ) : (
        <div className="relative pl-5 before:absolute before:top-3.5 before:bottom-3.5 before:left-1 before:w-0.5 before:rounded-sm before:bg-[var(--p-06)]">
          {shown.map((i, idx) => {
            const isNow = !i.paid && when(i) === today
            const past = !i.paid && when(i) < today
            return (
              <div key={i._id}>
                {idx === markerAt && idx !== 0 && <TodayMarker />}
                <button
                  onClick={() => openItem({ id: i._id as Id<'items'> })}
                  disabled={readOnly}
                  className={cn(
                    'relative grid w-full grid-cols-[6rem_1fr_auto] items-baseline gap-3 rounded-[var(--radius-2)] py-[0.5625rem] pr-1.5 text-left text-sm transition-colors duration-[120ms] hover:bg-[var(--p-06)] disabled:cursor-default disabled:hover:bg-transparent',
                    i.paid && 'text-[var(--muted-foreground)]',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-3.5 -left-[1.3rem] size-2.5 rounded-full transition-all duration-[250ms]',
                      i.paid
                        ? 'bg-[var(--savings)]'
                        : isNow
                          ? 'bg-[var(--brand-primary)] ring-[3px] ring-[var(--p-16)]'
                          : past
                            ? 'bg-[var(--muted-foreground)] opacity-45'
                            : 'bg-card shadow-[inset_0_0_0_1.5px_var(--p-60)]',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[0.8125rem] font-medium whitespace-nowrap',
                      isNow ? 'text-[var(--brand-primary)]' : 'text-[var(--muted-foreground)]',
                    )}
                  >
                    {dateLabel(on(i))}
                  </span>
                  <span
                    className={cn(
                      'font-medium [overflow-wrap:anywhere]',
                      i.paid && 'line-through decoration-[var(--line)]',
                    )}
                  >
                    {i.locked && <Lock className="mr-1 inline size-2.5 align-[-1px] opacity-55" />}
                    {i.name}
                    {i.group && (
                      <small className="block text-xs font-normal text-[var(--muted-foreground)]">{i.group}</small>
                    )}
                  </span>
                  <b className={cn('tabular-nums', i.paid ? 'font-medium' : 'font-semibold')}>
                    {krw(i.amount ?? 0).replace(' kr', '')}
                  </b>
                </button>
              </div>
            )
          })}
          {markerAt === shown.length && today !== Infinity && <TodayMarker end />}
        </div>
      )}

      {dated.length > shown.length && (
        <Link
          href="/plan"
          className="pt-2.5 text-sm font-semibold text-[var(--brand-primary)] underline decoration-[var(--p-16)] underline-offset-[3px] hover:decoration-[var(--brand-primary)]"
        >
          All {dated.length} in Plan
        </Link>
      )}
    </section>
  )
}

function TodayMarker({ end }: { end?: boolean }) {
  return (
    <div className={cn('relative h-0', end ? 'mt-4 mb-2' : 'my-[0.5625rem]')}>
      <div className="absolute top-0 right-0 -left-5 border-t border-dashed border-[var(--brand-primary)] opacity-45" />
      <span className="absolute -top-2 -left-5 bg-card pr-2 text-[0.6875rem] font-extrabold tracking-[0.07em] text-[var(--brand-primary)] uppercase">
        Today
      </span>
    </div>
  )
}
