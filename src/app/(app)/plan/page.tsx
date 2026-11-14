'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { Lock, Plus } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

export default function PlanPage() {
  const { monthKey: key } = useMonth()
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

  const loading = summary === undefined || items === undefined
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

        <div role="tablist" className="mb-3 flex rounded-[7px] bg-[var(--p-06)] p-[3px] lg:hidden">
          {BUCKETS.map((b) => (
            <button
              key={b}
              role="tab"
              aria-selected={active === b}
              onClick={() => setActive(b)}
              className={cn(
                'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-2)] text-sm transition-colors duration-[120ms]',
                active === b
                  ? 'bg-card font-medium text-[var(--text)] shadow-[0_1px_3px_rgba(0,0,0,.08),0_0_0_1px_var(--p-10)]'
                  : 'text-[var(--text)]',
              )}
            >
              <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
              {BUCKET_LABELS[b]}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr] lg:gap-6">
          <div className="overflow-hidden rounded-[var(--radius-4)] bg-card shadow-[inset_0_0_0_1px_var(--line)]">
            {loading ? (
              <PlanRowsSkeleton />
            ) : summary?.fromHistory ? (
              <>
                <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  <Lock className="size-3.5" />
                  Imported from your sheet. Read only.
                </div>
                {history.length === 0 ? (
                  <Empty>No {BUCKET_LABELS[active].toLowerCase()} rows in this month.</Empty>
                ) : (
                  history.map((t) => (
                    <div
                      key={t._id}
                      className="flex min-h-12 items-center gap-3 border-t border-[var(--line)] px-4 py-1 first:border-t-0"
                    >
                      <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-[var(--text)]">
                        {t.description}
                        {t.category && (
                          <small className="block text-xs font-normal text-[var(--muted-foreground)] capitalize">
                            {t.category}
                          </small>
                        )}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{krw(Math.abs(t.amount))}</span>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => openItem({ bucket: active })}
                  className="flex w-full items-center gap-2.5 border-b border-[var(--line)] p-3 text-[0.9375rem] font-semibold text-[var(--brand-primary)] transition-colors duration-[120ms] hover:bg-[var(--p-04)]"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-[var(--p-06)]">
                    <Plus className="size-4" />
                  </span>
                  Add to {BUCKET_LABELS[active]}
                </button>
                {activeItems.length === 0 ? (
                  <Empty>Nothing in {BUCKET_LABELS[active]} yet.</Empty>
                ) : (
                  activeItems.map((i) => <TodoRow key={i._id} item={i} onOpen={(id) => openItem({ id })} />)
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
              paidCount={activeItems.filter((i) => i.paid).length}
              itemCount={activeItems.length}
              planned={totals[active]}
              goal={summary.goalAmt[active]}
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
