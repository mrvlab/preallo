'use client'

import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { krw } from '@/lib/format'

const BUCKETS = ['needs', 'wants', 'savings'] as const

export function ReviewQueue() {
  const txns = useQuery(api.transactions.listForReview)
  const review = useMutation(api.transactions.review)

  async function assign(id: Id<'transactions'>, bucket: string) {
    await review({ id, patch: { bucket } })
  }

  if (txns === undefined) {
    return (
      <div className="h-24 animate-pulse rounded-[var(--radius-4)] bg-[var(--p-06)]" />
    )
  }

  if (txns.length === 0) {
    return (
      <div className="rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5 text-sm text-[var(--muted-foreground)]">
        Nothing to review. Rows the rules could not place with confidence land here.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
      <h3 className="pb-2 text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
        Review queue ({txns.length})
      </h3>
      {txns.map((t) => (
        <div
          key={t._id}
          className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 last:border-b-0 text-sm"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-[var(--text)]">{t.description}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {t.monthKey} · {krw(Math.abs(t.amount))}
            </div>
          </div>
          <div className="flex gap-1">
            {BUCKETS.map((b) => (
              <button
                key={b}
                onClick={() => assign(t._id, b)}
                className="rounded-[var(--radius-2)] border border-[var(--line)] px-2 py-1 text-xs capitalize hover:bg-[var(--p-06)]"
                style={{ color: `var(--${b}-ink)` }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
