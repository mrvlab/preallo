'use client'

import { useQuery } from 'convex/react'
import { Plus } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { HeroCard } from '@/components/overview/hero-card'
import { BucketCard, type Bucket } from '@/components/overview/bucket-card'
import { GoalsRingCard } from '@/components/overview/goals-ring-card'
import { ComingUp } from '@/components/overview/coming-up'

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function OverviewPage() {
  const key = currentMonthKey()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })
  const needsHistory = useQuery(api.months.bucketHistory, {
    key,
    bucket: 'needs',
    months: 3,
  })
  const wantsHistory = useQuery(api.months.bucketHistory, {
    key,
    bucket: 'wants',
    months: 3,
  })
  const savingsHistory = useQuery(api.months.bucketHistory, {
    key,
    bucket: 'savings',
    months: 3,
  })

  if (summary === undefined || items === undefined) {
    return (
      <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--p-06)]" />
      </div>
    )
  }

  if (summary === null) {
    return (
      <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
        <p className="text-sm text-[var(--muted-foreground)]">
          Setting up your first month.
        </p>
      </div>
    )
  }

  const { totals, income, reserved, free, pct, goals, paid, payable, missing } =
    summary
  const missingCount = missing
  const [year, m] = key.split('-')
  const monthName = MONTHS_LONG[Number(m) - 1]

  const historyByBucket: Record<Bucket, typeof needsHistory> = {
    needs: needsHistory,
    wants: wantsHistory,
    savings: savingsHistory,
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          aria-label="New item or month"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
        >
          <Plus size={18} />
        </button>
        <h1 className="flex items-baseline gap-2 text-[22px] font-semibold tracking-[-0.02em] text-[var(--text)]">
          {monthName}
          <span className="text-sm font-medium text-[var(--muted-foreground)]">
            {year}
          </span>
        </h1>
      </header>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="flex flex-col gap-4">
          <HeroCard
            free={free}
            income={income}
            reserved={reserved}
            missingCount={missingCount}
            paid={paid}
            payable={payable}
          />
          {(['needs', 'wants', 'savings'] as Bucket[]).map((b) => (
            <BucketCard
              key={b}
              bucket={b}
              amount={totals[b]}
              pct={pct[b]}
              goal={goals[b]}
              history={historyByBucket[b] ?? []}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <GoalsRingCard pct={pct} goals={goals} />
          <ComingUp items={items} monthKey={key} />
        </div>
      </div>
    </div>
  )
}
