'use client'

import { useQuery } from '@/lib/use-query'
import { api } from '../../../../convex/_generated/api'
import { HeroCard } from '@/components/overview/hero-card'
import { BucketCard } from '@/components/overview/bucket-card'
import { GoalsRingCard } from '@/components/overview/goals-ring-card'
import { ComingUp } from '@/components/overview/coming-up'
import { CategoriesCard } from '@/components/overview/categories-card'
import { OverviewSkeleton } from '@/components/overview/overview-skeleton'
import { MonthHeader } from '@/components/month-header'
import { useMonth } from '@/components/month-context'
import { type Bucket } from '@/lib/months'
import type { Id } from '../../../../convex/_generated/dataModel'

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

type Imported = { _id: Id<'transactions'>; date: string; description: string; amount: number; category?: string }

// Imported rows matched to a bank payment carry its real date; unmatched ones keep the sheet's
// placeholder, the 1st of the month, so only the matched ones are listed. All of them are paid.
function paidFromHistory(rows: Imported[], key: string) {
  return rows
    .filter((r) => r.amount < 0 && r.category !== 'salary' && r.date !== `${key}-01`)
    .map((r) => ({ _id: r._id, name: r.description, amount: -r.amount, date: r.date, paid: true, locked: false }))
}

export default function OverviewPage() {
  const { monthKey: key, ready } = useMonth()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })
  const needs = useQuery(api.months.bucketHistory, { key, bucket: 'needs', months: 3 })
  const wants = useQuery(api.months.bucketHistory, { key, bucket: 'wants', months: 3 })
  const savings = useQuery(api.months.bucketHistory, { key, bucket: 'savings', months: 3 })
  const history = { needs, wants, savings }
  // Imported months have no items; their categories come from the imported rows instead.
  const imported = useQuery(api.transactions.listForMonth, summary?.fromHistory ? { monthKey: key } : 'skip')

  const loading = !ready || summary === undefined || items === undefined

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
          <div className="grid gap-6 @min-[60rem]/main:grid-cols-[672fr_486fr]">
            <div className="contents @min-[60rem]/main:flex @min-[60rem]/main:flex-col @min-[60rem]/main:gap-6">
              <HeroCard
                monthKey={key}
                free={summary.left}
                income={summary.income}
                reserved={summary.reserved}
                missingCount={summary.missing}
                paid={summary.paid}
                payable={summary.payable}
              />
              <div className="order-3 flex flex-col gap-6 @min-[60rem]/main:order-none">
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
            <div className="contents @min-[60rem]/main:flex @min-[60rem]/main:flex-col @min-[60rem]/main:gap-6">
              <div className="order-2 @min-[60rem]/main:order-none">
                <GoalsRingCard planned={summary.totals} goal={summary.goalAmt} />
              </div>
              <div className="order-4 @min-[60rem]/main:order-none">
                {summary.fromHistory ? (
                  <ComingUp items={paidFromHistory(imported ?? [], key)} monthKey={key} readOnly />
                ) : (
                  <ComingUp items={items} monthKey={key} />
                )}
              </div>
              <div className="order-5 @min-[60rem]/main:order-none">
                <CategoriesCard rows={summary.fromHistory ? (imported ?? []) : items} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
