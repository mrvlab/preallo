'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Plus } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { BucketChip, type Bucket } from '@/components/plan/bucket-chip'
import { TodoRow } from '@/components/plan/todo-row'
import { SideBox } from '@/components/plan/side-box'
import { ItemSheet } from '@/components/plan/item-sheet'
import { cn } from '@/lib/utils'

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

export default function PlanPage() {
  const key = currentMonthKey()
  const summary = useQuery(api.months.summary, { key })
  const items = useQuery(api.items.listForMonth, { monthKey: key })
  const create = useMutation(api.items.create)

  const [active, setActive] = useState<Bucket>('needs')
  const [openId, setOpenId] = useState<Id<'items'> | null>(null)

  const perBucket = useMemo(() => {
    const map: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
    items?.forEach((i) => {
      if ((BUCKETS as string[]).includes(i.bucket))
        map[i.bucket as Bucket] += i.amount ?? 0
    })
    return map
  }, [items])

  const activeItems = items?.filter((i) => i.bucket === active) ?? []
  const paidCount = activeItems.filter((i) => i.paid).length

  async function addItem() {
    await create({
      monthKey: key,
      bucket: active,
      name: 'New item',
    })
  }

  if (summary === undefined || items === undefined) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 md:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--p-06)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-5 md:p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
          Plan
        </h1>
      </div>

      <div className="hidden md:flex md:gap-2 md:pb-4">
        {BUCKETS.map((b) => (
          <BucketChip
            key={b}
            bucket={b}
            total={perBucket[b]}
            active={active === b}
            onClick={() => setActive(b)}
          />
        ))}
      </div>

      <div className="flex gap-2 pb-4 md:hidden">
        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setActive(b)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-3)] h-9 text-sm font-medium transition-colors duration-[120ms]',
              active === b
                ? 'bg-white text-[var(--text)] shadow-sm'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            <i
              className="h-2 w-2 rounded-full"
              style={{ background: `var(--${b})` }}
            />
            <span className="capitalize">{b}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px] md:gap-6">
        <div className="flex flex-col rounded-[var(--radius-4)] border border-[var(--line)] bg-card">
          <button
            onClick={addItem}
            className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3 text-sm text-[var(--brand-primary)] hover:bg-[var(--p-04)]"
          >
            <Plus size={16} /> Add to {active}
          </button>
          {activeItems.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">
              No items yet. Add one to start planning.
            </div>
          ) : (
            activeItems.map((i) => (
              <TodoRow key={i._id} item={i} onOpen={setOpenId} />
            ))
          )}
        </div>

        <SideBox
          paidCount={paidCount}
          itemCount={activeItems.length}
          planned={perBucket[active]}
          goal={summary?.goalAmt[active] ?? 0}
          pctOfSalary={summary?.pct[active] ?? 0}
        />
      </div>

      <ItemSheet itemId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
