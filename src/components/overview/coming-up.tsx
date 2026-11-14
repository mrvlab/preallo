'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'
import { krw } from '@/lib/format'
import { RollingDigits } from '@/components/motion/rolling-digits'

type Item = {
  _id: string
  name: string
  amount?: number
  due?: number
  bucket: string
  paid: boolean
  locked: boolean
  category?: string
}

type Props = { items: Item[]; monthKey: string }

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayLabel(monthKey: string, day: number) {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, day))
  return `${WEEKDAY_SHORT[date.getUTCDay()]} ${day}`
}

export function ComingUp({ items, monthKey }: Props) {
  const unpaid = items
    .filter((i) => !i.paid && i.amount && i.amount > 0 && i.due)
    .sort((a, b) => (a.due ?? 99) - (b.due ?? 99))
  const total = unpaid.reduce((a, i) => a + (i.amount ?? 0), 0)
  const today = new Date().getUTCDate()
  const shown = unpaid.slice(0, 7)
  const todayIdx = shown.findIndex((i) => (i.due ?? 0) >= today)
  const insertTodayAt = todayIdx === -1 ? shown.length : todayIdx

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5 md:p-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
          COMING UP
        </span>
        <span className="text-[24px] font-semibold leading-tight tracking-[-0.02em] tabular-nums text-[var(--text)]">
          <RollingDigits value={krw(total)} />
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          still to leave your account
        </span>
      </div>
      {unpaid.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nothing pencilled in. Items with amounts and a due day show here.
        </p>
      ) : (
        <ul className="flex flex-col pt-2">
          {shown.map((i, idx) => {
            const isToday = i.due === today
            const past = (i.due ?? 0) < today
            return (
              <li key={i._id} className="contents">
                {idx === insertTodayAt && idx !== 0 && <TodayDivider />}
                <div className="grid grid-cols-[18px_60px_1fr_auto] items-center gap-3 py-1.5 text-sm">
                  <span
                    className={
                      isToday
                        ? 'h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)] ring-[3px] ring-[var(--p-16)]'
                        : past
                          ? 'h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)] opacity-50'
                          : 'h-1.5 w-1.5 rounded-full bg-[var(--p-16)]'
                    }
                  />
                  <span
                    className={
                      isToday
                        ? 'text-xs font-medium text-[var(--brand-primary)]'
                        : 'text-xs text-[var(--muted-foreground)]'
                    }
                  >
                    {dayLabel(monthKey, i.due!)}
                  </span>
                  <span className="flex items-center gap-1.5 truncate text-[var(--text)]">
                    {i.locked && (
                      <Lock
                        size={11}
                        className="shrink-0 text-[var(--muted-foreground)]"
                      />
                    )}
                    <span className="truncate">{i.name}</span>
                  </span>
                  <span className="tabular-nums text-[var(--muted-foreground)]">
                    {krw(i.amount ?? 0)}
                  </span>
                </div>
              </li>
            )
          })}
          {insertTodayAt === shown.length && shown.length > 0 && <TodayDivider />}
        </ul>
      )}
      {unpaid.length > 0 && (
        <Link
          href="/plan"
          className="text-xs font-medium text-[var(--brand-primary)] underline decoration-[var(--p-16)] decoration-1 underline-offset-[3px] hover:decoration-[var(--brand-primary)]"
        >
          All {unpaid.length} in Plan
        </Link>
      )}
    </section>
  )
}

function TodayDivider() {
  return (
    <div className="relative my-2 flex items-center">
      <span className="absolute left-0 -top-1 bg-card pr-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-primary)]">
        Today
      </span>
      <div className="mt-2 w-full border-t border-dashed border-[var(--brand-primary)] opacity-40" />
    </div>
  )
}
