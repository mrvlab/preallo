'use client'

import { GoalsRings, goalPercent } from '@/components/overview/goals-rings'
import { BUCKET_LABELS, type Bucket } from '@/lib/months'

type Amounts = Record<Bucket, number>

export function RingBox({ bucket, planned, goal }: { bucket: Bucket; planned: Amounts; goal: Amounts }) {
  const percent = goalPercent(bucket, planned[bucket], goal[bucket])

  return (
    <section className="@container flex items-center gap-5 rounded-[var(--radius-4)] bg-card p-4 shadow-[inset_0_0_0_1px_var(--line)]">
      {/* Larger ring once the column has room for it beside the text, which already says it all. */}
      <div aria-hidden="true" className="shrink-0">
        <GoalsRings className="size-[7.5rem] @min-[22rem]:size-[10.625rem]" planned={planned} goal={goal} focus={bucket} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="text-[0.6875rem] font-bold tracking-[0.07em] uppercase"
          style={{ color: `var(--${bucket}-ink)` }}
        >
          {BUCKET_LABELS[bucket]} ring
        </span>
        <div className="text-[1.75rem] leading-[1.2] font-extrabold tracking-[-0.02em] text-[var(--text)] tabular-nums">
          {percent !== null ? (
            <>
              {percent}%
              <small className="ml-1.5 text-sm font-medium tracking-normal text-[var(--muted-foreground)]">of goal</small>
            </>
          ) : (
            'No goal'
          )}
        </div>
      </div>
    </section>
  )
}
