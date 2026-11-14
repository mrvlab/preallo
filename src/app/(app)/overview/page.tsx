'use client'

import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { HeroCard } from '@/components/overview/hero-card'
import { BucketCard } from '@/components/overview/bucket-card'
import { GoalsRingCard } from '@/components/overview/goals-ring-card'
import { ComingUp } from '@/components/overview/coming-up'
import { OverviewSkeleton } from '@/components/overview/overview-skeleton'
import { MonthHeader } from '@/components/month-header'
import { useMonth } from '@/components/month-context'
import type { Bucket } from '@/lib/months'

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

export default function OverviewPage() {
  const { monthKey: key } = useMonth()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })
  const needs = useQuery(api.months.bucketHistory, { key, bucket: 'needs', months: 3 })
  const wants = useQuery(api.months.bucketHistory, { key, bucket: 'wants', months: 3 })
  const savings = useQuery(api.months.bucketHistory, { key, bucket: 'savings', months: 3 })
  const history = { needs, wants, savings }

  const loading = summary === undefined || items === undefined

  return (
    <>
      <MonthHeader />
      <div className="px-4 pt-2 pb-8 lg:px-7 lg:pt-2.5 lg:pb-7">
        {loading ? (
          <OverviewSkeleton />
        ) : summary === null ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No budget for this month yet. Use + to start it.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[672fr_486fr]">
            <div className="contents lg:flex lg:flex-col lg:gap-6">
              <HeroCard
                monthKey={key}
                // Imported months are finished: what is left is salary minus everything spent,
                // not salary minus fixed costs as while planning.
                free={summary.fromHistory ? summary.left : summary.free}
                income={summary.income}
                reserved={summary.fromHistory ? summary.income - summary.left : summary.reserved}
                missingCount={summary.missing}
                paid={summary.paid}
                payable={summary.payable}
              />
              <div className="order-3 flex flex-col gap-6 lg:order-none">
                {summary.fromHistory && summary.unreviewed > 0 && (
                  <a
                    href="/import"
                    className="rounded-[var(--radius-4)] bg-[var(--needs-soft)] px-5 py-3 text-sm text-[var(--needs-ink)]"
                  >
                    {summary.unreviewed} imported rows have no bucket yet and are left out of these totals. Review them.
                  </a>
                )}
                {BUCKETS.map((b) => (
                  <BucketCard
                    key={b}
                    bucket={b}
                    amount={summary.totals[b]}
                    pct={summary.pct[b]}
                    goal={summary.goals[b]}
                    history={history[b] ?? []}
                  />
                ))}
              </div>
            </div>
            <div className="contents lg:flex lg:flex-col lg:gap-6">
              <div className="order-2 lg:order-none">
                <GoalsRingCard pct={summary.pct} goals={summary.goals} />
              </div>
              <div className="order-4 lg:order-none">
                <ComingUp items={items} monthKey={key} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
