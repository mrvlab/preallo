'use client'

import { krw } from '@/lib/format'
import { cn } from '@/lib/utils'

export type Bucket = 'needs' | 'wants' | 'savings'

const LABELS: Record<Bucket, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
}

type Props = {
  bucket: Bucket
  total: number
  active?: boolean
  onClick?: () => void
}

export function BucketChip({ bucket, total, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-[var(--radius-3)] px-3 h-9 text-sm font-medium transition-colors duration-[120ms]',
        active
          ? 'bg-[var(--brand-primary)] text-white'
          : 'bg-[var(--p-06)] text-[var(--text)] hover:bg-[var(--p-10)]',
      )}
      aria-pressed={active}
    >
      <i
        className="h-2 w-2 rounded-full"
        style={{ background: `var(--${bucket})` }}
      />
      {LABELS[bucket]}
      <span className="ml-1 tabular-nums opacity-80">{krw(total)}</span>
    </button>
  )
}
