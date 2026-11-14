'use client'

import { krw } from '@/lib/format'
import { MiniMonths } from './mini-months'

export type Bucket = 'needs' | 'wants' | 'savings'

const LABELS: Record<Bucket, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
}

type Props = {
  bucket: Bucket
  amount: number
  pct: number
  goal: number
  history?: number[]
}

export function BucketCard({ bucket, amount, pct, goal, history = [] }: Props) {
  const inkVar = `var(--${bucket}-ink)`
  const dotVar = `var(--${bucket})`
  const diff = Math.round(pct - goal)
  const sub =
    bucket === 'savings'
      ? pct >= goal
        ? 'On target'
        : `${Math.abs(diff)}% to go`
      : pct > goal
        ? `${diff}% over goal`
        : `${Math.abs(diff)}% room`
  const tone =
    bucket === 'savings'
      ? pct >= goal
        ? 'text-[var(--savings-ink)]'
        : 'text-[var(--muted-foreground)]'
      : pct > goal
        ? 'text-[var(--warn)]'
        : 'text-[var(--muted-foreground)]'

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
      <div className="flex-1">
        <div
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: inkVar }}
        >
          <i
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: dotVar }}
          />
          {LABELS[bucket]}
        </div>
        <div
          className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[var(--text)]"
        >
          {krw(amount)}
        </div>
        <div className={`mt-2 text-sm ${tone}`}>
          {Math.round(pct)}% of salary · goal {goal}% · {sub}
        </div>
      </div>
      <MiniMonths values={history} goal={goal} color={dotVar} />
    </section>
  )
}
