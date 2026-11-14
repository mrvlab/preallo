'use client'

import { BUCKET_LABELS, type Bucket } from '@/lib/months'
import { cn } from '@/lib/utils'

export type { Bucket }

const amount = (n: number) => new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(n)

export function BucketChip({
  bucket,
  total,
  active,
  onClick,
}: {
  bucket: Bucket
  total: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-[2.125rem] items-center gap-2 rounded-[var(--radius-3)] px-3.5 text-[0.9375rem] font-medium transition-colors duration-[120ms]',
        active
          ? 'bg-[var(--brand-primary)] text-[var(--primary-foreground)]'
          : 'bg-[var(--p-04)] text-[var(--text)] hover:bg-[var(--p-06)]',
      )}
    >
      <i className="size-2 rounded-full" style={{ background: active ? 'currentColor' : `var(--${bucket})`, opacity: active ? 0.9 : 1 }} />
      {BUCKET_LABELS[bucket]}
      <small className="text-[0.78rem] font-semibold tabular-nums opacity-75">{amount(total)}</small>
    </button>
  )
}
