'use client'

import { AlertCircle, Check } from 'lucide-react'
import { krw } from '@/lib/format'
import type { Bucket } from '@/lib/months'
import { cn } from '@/lib/utils'

type Props = {
  bucket: Bucket
  paidCount: number
  itemCount: number
  planned: number
  goalAmount: number
  goalPct: number
  pctOfSalary: number
}

const kr2 = (n: number) =>
  `${new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} kr`

export function SideBox({ bucket, paidCount, itemCount, planned, goalAmount, goalPct, pctOfSalary }: Props) {
  const paidPct = itemCount > 0 ? (paidCount / itemCount) * 100 : 0
  // Meter runs to whichever is larger, the goal or what is planned, so the goal tick stays inside.
  const scale = Math.max(goalAmount, planned, 1) * 1.25
  const fill = Math.min(100, (planned / scale) * 100)
  const tick = Math.min(100, (goalAmount / scale) * 100)
  // In whole öre: a sum of amounts like 8 612,07 carries float dust that would read as over.
  const diff = Math.round((planned - goalAmount) * 100) / 100
  const status =
    bucket === 'savings'
      ? diff >= 0
        ? { tone: 'ok' as const, text: 'Goal reached' }
        : { tone: 'go' as const, text: `${krw(-diff)} to go` }
      : diff > 0
        ? { tone: 'warn' as const, text: `${krw(diff)} over` }
        : { tone: 'ok' as const, text: `${krw(-diff)} room` }

  return (
    <aside
      className="rounded-[var(--radius-4)] p-4"
      style={{ background: `var(--${bucket}-soft)` }}
    >
      <div className="text-[0.6875rem] font-bold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">Paid</div>
      <div className="text-[1.75rem] leading-[1.2] font-extrabold tracking-[-0.02em] text-[var(--text)] tabular-nums">
        {paidCount} of {itemCount}
      </div>
      <div className="mt-1.5 mb-3 h-2 overflow-hidden rounded-[2px] bg-white/60 dark:bg-white/12">
        <i
          className="block h-full bg-[var(--savings)] transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${paidPct}%` }}
        />
      </div>
      <Line label="Planned" value={kr2(planned)} />
      <Line label={`Goal ${goalPct}%`} value={kr2(goalAmount)} />
      <Line label="Share of salary" value={`${pctOfSalary.toFixed(1)}%`} />
      <div className="relative mt-3.5 mb-1.5 h-3 rounded-[2px] bg-white/60 dark:bg-white/12">
        <i
          className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${fill}%`, background: `var(--${bucket})` }}
        />
        <b
          className="absolute -top-1 h-5 w-[3px] -translate-x-px rounded-[2px] bg-[var(--text)] opacity-75"
          style={{ left: `${tick}%` }}
        />
      </div>
      <div
        className={cn(
          'mt-2.5 flex items-center gap-2 text-[0.9375rem] font-semibold',
          status.tone === 'warn' ? 'text-[var(--warn)]' : status.tone === 'go' ? 'text-[var(--amber)]' : 'text-[var(--ok)]',
        )}
      >
        <span
          className="grid size-[1.375rem] shrink-0 place-items-center rounded-full"
          style={{
            background:
              status.tone === 'warn' ? 'var(--wants-soft)' : status.tone === 'go' ? 'var(--needs-soft)' : 'var(--savings-soft)',
          }}
        >
          {status.tone === 'ok' ? <Check className="size-3.5" strokeWidth={3} /> : <AlertCircle className="size-3.5" strokeWidth={2.5} />}
        </span>
        {status.text}
      </div>
    </aside>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-t border-black/8 py-[0.3125rem] text-sm dark:border-white/12">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <b className="font-bold text-[var(--text)] tabular-nums">{value}</b>
    </div>
  )
}
