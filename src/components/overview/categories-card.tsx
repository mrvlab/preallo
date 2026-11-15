'use client'

import { useEffect, useState } from 'react'
import { krw } from '@/lib/format'
import { BUCKET_LABELS, CATEGORIES, type Bucket } from '@/lib/months'
import { usePrefersReducedMotion } from '@/components/motion/rolling-digits'

export type CategoryRow = { bucket?: string; category?: string; amount?: number }

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

type Group = { label: string; total: number; parts: Record<Bucket, number> }

// Savings rows are grouped as Savings whatever their category, so money put aside never reads
// as spending. Unknown or missing categories fall under Other.
function groupRows(rows: CategoryRow[]) {
  const groups = new Map<string, Group>()
  for (const r of rows) {
    const amount = Math.abs(r.amount ?? 0)
    if (!amount || !BUCKETS.includes(r.bucket as Bucket)) continue
    const bucket = r.bucket as Bucket
    const label =
      bucket === 'savings' ? 'Savings' : CATEGORIES.includes(r.category ?? '') ? r.category! : 'Other'
    const g = groups.get(label) ?? { label, total: 0, parts: { needs: 0, wants: 0, savings: 0 } }
    g.total += amount
    g.parts[bucket] += amount
    groups.set(label, g)
  }
  return [...groups.values()].sort((a, b) => b.total - a.total)
}

export function CategoriesCard({ rows }: { rows: CategoryRow[] }) {
  const reduced = usePrefersReducedMotion()
  // Bars start empty and grow in on the next frame, like the history bars on the bucket cards.
  const [shown, setShown] = useState(reduced)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const groups = groupRows(rows)
  const total = groups.reduce((a, g) => a + g.total, 0)
  const top = groups[0]
  // Bars are measured against the biggest category, so the smaller ones stay readable.
  const scale = top?.total ?? 1
  const share = (v: number) => Math.round((v / (total || 1)) * 100)

  return (
    <section className="flex flex-col rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:px-7 lg:py-[1.65rem]">
      <span className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
        Categories
      </span>
      {!top ? (
        <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
          Give your rows an amount and a category and they show here.
        </p>
      ) : (
        <>
          <div className="mt-1 mb-[1.125rem] flex flex-wrap items-baseline gap-2">
            <b className="text-2xl font-bold tracking-[-0.02em] text-[var(--text)]">{top.label}</b>
            <span className="text-sm text-[var(--muted-foreground)]">
              is the biggest, {share(top.total)}% of your plan
            </span>
          </div>
          <ul className="flex flex-col gap-3.5">
            {groups.map((g) => (
              <li key={g.label} className="min-w-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-[var(--text)]">{g.label}</span>
                  <span className="shrink-0 tabular-nums">
                    <b className="font-semibold text-[var(--text)]">{krw(g.total)}</b>
                    <span className="ml-2 inline-block w-[2.6em] text-right text-[0.8125rem] text-[var(--muted-foreground)]">
                      {share(g.total)}%
                    </span>
                  </span>
                </div>
                {/* One track per category, filled in the colour of each bucket it draws from. */}
                <div
                  className="flex h-2 overflow-hidden rounded-full bg-[var(--p-04)]"
                  role="img"
                  aria-label={BUCKETS.filter((b) => g.parts[b] > 0)
                    .map((b) => `${krw(g.parts[b])} ${b}`)
                    .join(', ')}
                >
                  <div
                    className="flex h-full gap-px transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
                    style={{ width: shown ? `${Math.max(2, (g.total / scale) * 100)}%` : '0%' }}
                  >
                    {BUCKETS.filter((b) => g.parts[b] > 0).map((b) => (
                      <i
                        key={b}
                        className="block h-full basis-0"
                        style={{ flexGrow: g.parts[b], background: `var(--${b})` }}
                      />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[var(--line)] pt-4 text-[0.8125rem] text-[var(--muted-foreground)]">
            {BUCKETS.filter((b) => groups.some((g) => g.parts[b] > 0)).map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <i className="size-2 rounded-full" style={{ background: `var(--${b})` }} />
                {BUCKET_LABELS[b]}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
