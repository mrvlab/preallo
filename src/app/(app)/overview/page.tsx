'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { HeroCard } from '@/components/overview/hero-card'
import { BucketCard } from '@/components/overview/bucket-card'
import { GoalsRings } from '@/components/overview/goals-rings'
import { ComingUp } from '@/components/overview/coming-up'

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

export default function OverviewPage() {
  const key = currentMonthKey()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })

  if (summary === undefined || items === undefined) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--p-06)]" />
      </div>
    )
  }

  if (summary === null) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
        <p className="text-sm text-[var(--muted-foreground)]">
          Setting up your first month.
        </p>
      </div>
    )
  }

  const { totals, income, reserved, free, pct, goals } = summary

  return (
    <div className="mx-auto w-full max-w-6xl p-5 md:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
          Overview
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="flex flex-col gap-4 md:gap-5">
          <HeroCard free={free} income={income} reserved={reserved} />
          <div className="grid gap-4 sm:grid-cols-3">
            <BucketCard
              bucket="needs"
              amount={totals.needs}
              pct={pct.needs}
              goal={goals.needs}
            />
            <BucketCard
              bucket="wants"
              amount={totals.wants}
              pct={pct.wants}
              goal={goals.wants}
            />
            <BucketCard
              bucket="savings"
              amount={totals.savings}
              pct={pct.savings}
              goal={goals.savings}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <section className="flex flex-col items-center gap-3 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
            <div className="self-start text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)]">
              YOUR GOALS
            </div>
            <GoalsRings pct={pct} goals={goals} />
          </section>
          <ComingUp items={items} />
        </div>
      </div>
    </div>
  )
}
