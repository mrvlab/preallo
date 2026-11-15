'use client'

import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { krw } from '@/lib/format'
import { BUCKET_LABELS, monthName, monthYear } from '@/lib/months'
import { cardClass, cardLabelClass } from '@/components/ui/card-classes'
import { Bone } from '@/components/ui/skeleton-block'

const BUCKETS = ['needs', 'wants', 'savings'] as const

export function ReviewQueue() {
  const txns = useQuery(api.transactions.listForReview)
  const review = useMutation(api.transactions.review)

  async function assign(id: Id<'transactions'>, bucket: string) {
    await review({ id, patch: { bucket } })
  }

  if (txns === undefined) {
    return (
      <section className={cardClass}>
        <Bone className="h-3.5 w-24" shade="soft" />
        <Bone className="mt-2.5 h-3.5 w-64" shade="line" />
      </section>
    )
  }

  if (txns.length === 0) {
    return (
      <section className={cardClass}>
        <span className={cardLabelClass}>To review</span>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Nothing to review. Rows the rules could not place land here.
        </p>
      </section>
    )
  }

  return (
    <section className={cardClass}>
      <span className={cardLabelClass}>To review</span>
      <p className="mt-1 mb-2 text-sm text-[var(--muted-foreground)]">
        {txns.length} {txns.length === 1 ? 'row' : 'rows'} the rules could not place. Pick a bucket for each.
      </p>
      {txns.map((t) => (
        <div
          key={t._id}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[var(--line)] py-3 text-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-[var(--text)]">{t.description}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {monthName(t.monthKey)} {monthYear(t.monthKey)} · {krw(Math.abs(t.amount))}
            </div>
          </div>
          <div className="flex gap-1.5">
            {BUCKETS.map((b) => (
              <button
                key={b}
                onClick={() => assign(t._id, b)}
                className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium text-[var(--text)] shadow-[inset_0_0_0_1px_var(--p-16)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
              >
                <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
                {BUCKET_LABELS[b]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
