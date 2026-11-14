'use client'

import { krw, daysLeftInMonth, weeksLeft } from '@/lib/format'
import { RollingDigits } from '@/components/motion/rolling-digits'

type Props = {
  free: number
  income: number
  reserved: number
}

export function HeroCard({ free, income, reserved }: Props) {
  const neg = free < 0
  const dl = daysLeftInMonth()
  const wl = weeksLeft()
  const perWeek = wl > 0 ? free / wl : 0
  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-4)] bg-[var(--hero-bg)] p-5 md:p-6">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)]">
        LEFT TO SPEND{dl > 0 ? ` · ${dl} DAYS LEFT` : ''}
      </div>
      <div
        className={`font-semibold leading-none tracking-[-0.03em] tabular-nums ${neg ? 'text-[var(--warn)]' : 'text-[var(--text)]'}`}
        style={{ fontSize: 52 }}
      >
        <RollingDigits value={krw(free)} />
      </div>
      <div className="text-sm text-[var(--muted-foreground)]">
        {krw(perWeek)}{' '}
        <span>a week for the next {wl} weeks</span>
      </div>
      {neg && (
        <div className="rounded-[var(--radius-2)] bg-[var(--wants-soft)] px-3 py-2 text-sm text-[var(--warn)]">
          Your plan needs more than your salary.
        </div>
      )}
      <div className="mt-2 text-xs text-[var(--muted-foreground)]">
        From <b className="text-[var(--text)]">{krw(income)}</b> salary,{' '}
        <b className="text-[var(--text)]">{krw(reserved)}</b> is reserved
      </div>
    </section>
  )
}
