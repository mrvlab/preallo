'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@/lib/use-query'
import { Check, Lock, Plus } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { BucketChip } from '@/components/plan/bucket-chip'
import { TodoRow } from '@/components/plan/todo-row'
import { SideBox } from '@/components/plan/side-box'
import { MonthHeader } from '@/components/month-header'
import { useMonth } from '@/components/month-context'
import { useModals } from '@/components/modals/modals-provider'
import { Bone } from '@/components/ui/skeleton-block'
import { krw } from '@/lib/format'
import { BUCKET_LABELS, type Bucket } from '@/lib/months'
import { Segmented } from '@/components/ui/segmented'

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

export default function PlanPage() {
  const { monthKey: key, editable, ready } = useMonth()
  const { openItem } = useModals()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })
  const txns = useQuery(
    api.transactions.listForMonth,
    summary?.fromHistory ? { monthKey: key } : 'skip',
  )
  const [active, setActive] = useState<Bucket>('needs')

  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get('b')
    if (b === 'needs' || b === 'wants' || b === 'savings') setActive(b)
  }, [])

  const perBucket = useMemo(() => {
    const map: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
    items?.forEach((i) => {
      if (i.bucket in map) map[i.bucket as Bucket] += i.amount ?? 0
    })
    return map
  }, [items])

  const loading = !ready || summary === undefined || items === undefined
  const activeItems = (items ?? []).filter((i) => i.bucket === active)
  const history = (txns ?? []).filter((t) => t.bucket === active && t.amount < 0)
  const totals = summary?.fromHistory ? summary.totals : perBucket

  return (
    <>
      <MonthHeader />
      <div className="px-4 pt-2 pb-8 lg:px-7 lg:pt-2.5 lg:pb-7">
        <div className="mb-4 hidden gap-2 lg:flex">
          {BUCKETS.map((b) =>
            loading ? (
              <Bone key={b} className="h-9 w-32 rounded-[var(--radius-3)]" shade="soft" />
            ) : (
              <BucketChip key={b} bucket={b} total={totals[b]} active={active === b} onClick={() => setActive(b)} />
            ),
          )}
        </div>

        <Segmented
          label="Bucket"
          className="mb-3 grid w-full lg:hidden"
          segmentClassName="text-[var(--text)]"
          value={active}
          onChange={setActive}
          options={BUCKETS.map((b) => ({
            value: b,
            label: (
              <>
                <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
                {BUCKET_LABELS[b]}
              </>
            ),
          }))}
        />

        <div className="grid items-start gap-4 @min-[60rem]/main:grid-cols-[2fr_1fr] @min-[60rem]/main:gap-6">
          <div className="overflow-hidden rounded-[var(--radius-4)] bg-card shadow-[inset_0_0_0_1px_var(--line)]">
            {loading ? (
              <PlanRowsSkeleton />
            ) : summary?.fromHistory ? (
              <>
                <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  <Lock className="size-3.5" />
                  Imported from your sheet. All paid.
                </div>
                {history.length === 0 ? (
                  <Empty>No {BUCKET_LABELS[active].toLowerCase()} rows in this month.</Empty>
                ) : (
                  history.map((t) => (
                    <div
                      key={t._id}
                      className="flex min-h-12 items-center gap-3 border-t border-[var(--line)] px-3 py-1 first:border-t-0"
                    >
                      <span
                        aria-label="Paid"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-[var(--primary-foreground)]"
                      >
                        <Check strokeWidth={3} className="size-[0.8125rem]" />
                      </span>
                      <span className="min-w-0 flex-1 py-2 text-[0.9375rem] leading-5 font-medium text-[var(--muted-foreground)] line-through decoration-[var(--p-16)]">
                        {t.description}
                      </span>
                      <span className="px-2 text-sm font-semibold text-[var(--muted-foreground)] tabular-nums">
                        {krw(Math.abs(t.amount))}
                      </span>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {editable ? (
                  <button
                    onClick={() => openItem({ bucket: active })}
                    className="flex w-full items-center gap-2.5 border-b border-[var(--line)] p-3 text-[0.9375rem] font-semibold text-[var(--brand-primary)] transition-colors duration-[120ms] hover:bg-[var(--p-04)]"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-[var(--p-06)]">
                      <Plus className="size-4" />
                    </span>
                    Add to {BUCKET_LABELS[active]}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                    <Lock className="size-3.5" />
                    Locked. You can change last month, this month and any month ahead.
                  </div>
                )}
                {activeItems.length === 0 ? (
                  <Empty>Nothing in {BUCKET_LABELS[active]} yet.</Empty>
                ) : (
                  activeItems.map((i) => (
                    <TodoRow key={i._id} item={i} readOnly={!editable} onOpen={(id) => openItem({ id })} />
                  ))
                )}
              </>
            )}
          </div>

          {loading || !summary ? (
            <div className="flex flex-col gap-3 rounded-[var(--radius-4)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Bone className="h-3 w-16" shade="soft" />
                  <Bone className="h-3.5 w-14" shade="mid" />
                </div>
              ))}
            </div>
          ) : (
            <SideBox
              bucket={active}
              paidCount={summary.fromHistory ? history.length : activeItems.filter((i) => i.paid).length}
              itemCount={summary.fromHistory ? history.length : activeItems.length}
              planned={totals[active]}
              goalAmount={summary.goalAmt[active]}
              goalPct={summary.goals[active]}
              pctOfSalary={summary.pct[active]}
            />
          )}
        </div>
      </div>
    </>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">{children}</div>
}

function PlanRowsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading plan">
      <div className="flex items-center gap-2.5 border-b border-[var(--line)] p-3">
        <Bone className="size-7" shade="soft" round />
        <Bone className="h-3.5 w-28" shade="mid" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex min-h-12 items-center gap-3 border-t border-[var(--line)] px-3 first:border-t-0">
          <Bone className="size-6" shade="mid" round />
          <Bone className="h-3.5 flex-1 max-w-48" shade="mid" />
          <Bone className="ml-auto h-3.5 w-16" shade="soft" />
        </div>
      ))}
    </div>
  )
}
