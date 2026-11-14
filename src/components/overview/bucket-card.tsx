'use client'

import { krw } from '@/lib/format'

export type Bucket = 'needs' | 'wants' | 'savings'

const LABELS: Record<Bucket, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
}

type HistoryPoint = { key: string; amount: number; goal: number }

type Props = {
  bucket: Bucket
  amount: number
  pct: number
  goal: number
  history?: HistoryPoint[]
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export function BucketCard({ bucket, amount, pct, goal, history = [] }: Props) {
  const inkVar = `var(--${bucket}-ink)`
  const dotVar = `var(--${bucket})`
  const diff = Math.round(pct - goal)
  const over = bucket === 'savings' ? pct < goal : pct > goal
  const empty = amount === 0
  const sub = empty
    ? bucket === 'savings'
      ? `${goal}% to put aside`
      : `${goal}% of salary set aside`
    : bucket === 'savings'
      ? pct >= goal
        ? 'On target'
        : `${Math.abs(diff)}% to the ${goal}% goal`
      : over
        ? `${diff}% over the ${goal}% goal`
        : `${Math.abs(diff)}% under the ${goal}% goal`
  const tone = empty
    ? 'text-[var(--muted-foreground)]'
    : bucket === 'savings'
      ? pct >= goal
        ? 'text-[var(--savings-ink)]'
        : 'text-[var(--muted-foreground)]'
      : over
        ? 'text-[var(--wants-ink)]'
        : 'text-[var(--muted-foreground)]'

  return (
    <section className="grid grid-cols-[1fr_280px] items-stretch gap-6 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5 md:p-6">
      <div className="flex flex-col justify-center">
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
        <div className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[var(--text)]">
          {krw(amount)}
        </div>
        <div className={`mt-2 text-xs ${tone}`}>{sub}</div>
      </div>
      <MiniBars history={history} goal={goal} color={dotVar} bucket={bucket} />
    </section>
  )
}

function MiniBars({
  history,
  goal,
  color,
  bucket,
}: {
  history: HistoryPoint[]
  goal: number
  color: string
  bucket: Bucket
}) {
  if (history.length === 0) {
    return (
      <div className="flex items-end justify-center border-l border-[var(--line)] pl-6 text-xs text-[var(--muted-foreground)]">
        History shows once you import or close months.
      </div>
    )
  }
  const points = history.slice(-3)
  const maxAmount = Math.max(...points.map((p) => p.amount), ...points.map((p) => p.goal), 1)
  const W = 240
  const H = 88
  const bars = Math.max(points.length, 1)
  const bw = W / (bars * 1.6)
  const gap = (W - bw * bars) / (bars - 1 || 1)
  const goalRatio = points[points.length - 1].goal
    ? points[points.length - 1].goal / maxAmount
    : 0.5
  const goalY = H - goalRatio * H

  return (
    <div className="relative border-l border-[var(--line)] pl-5">
      <svg viewBox={`0 0 ${W} ${H + 18}`} width="100%" height={H + 18} className="block">
        <text
          x={0}
          y={goalY + 12}
          fontSize={11}
          fill="var(--muted-foreground)"
        >
          {goal}%
        </text>
        <line
          x1={28}
          x2={W}
          y1={goalY}
          y2={goalY}
          stroke="var(--p-16)"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        {points.map((p, i) => {
          const h = (p.amount / maxAmount) * H
          const x = 28 + i * (bw + gap)
          const isLast = i === points.length - 1
          const pctLabel = p.goal > 0 ? Math.round((p.amount / (p.goal * (100 / (p.goal || 1)))) * 100) : 0
          const pctActual = p.goal > 0 ? Math.round((p.amount / (p.goal / (goal / 100)) ) * 100) : 0
          return (
            <g key={p.key}>
              {isLast && (
                <text
                  x={x + bw / 2}
                  y={H - h - 4}
                  fontSize={11}
                  fill={`var(--${bucket}-ink)`}
                  textAnchor="middle"
                  fontWeight={600}
                >
                  {pctActual}%
                </text>
              )}
              <rect
                x={x}
                y={H - h}
                width={bw}
                height={Math.max(2, h)}
                rx={4}
                fill={color}
                opacity={isLast ? 0.95 : 0.35}
              />
              <text
                x={x + bw / 2}
                y={H + 14}
                fontSize={11}
                fill="var(--muted-foreground)"
                textAnchor="middle"
              >
                {MONTH_SHORT[Number(p.key.split('-')[1]) - 1]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
