'use client'

import { useMutation } from 'convex/react'
import { Check } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { krw } from '@/lib/format'
import { cn } from '@/lib/utils'

export type PlanItem = {
  _id: Id<'items'>
  name: string
  amount?: number
  bucket: string
  paid: boolean
  locked: boolean
  due?: number
  category?: string
}

type Props = {
  item: PlanItem
  onOpen: (id: Id<'items'>) => void
}

export function TodoRow({ item, onOpen }: Props) {
  const toggle = useMutation(api.items.togglePaid)
  return (
    <div className="group flex items-center gap-3 border-b border-[var(--line)] px-2 py-2.5 last:border-b-0 hover:bg-[var(--p-04)]">
      <button
        aria-label={item.paid ? 'Mark unpaid' : 'Mark paid'}
        onClick={(e) => {
          e.stopPropagation()
          toggle({ id: item._id }).catch(console.error)
        }}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[120ms]',
          item.paid
            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
            : 'border-[var(--p-16)] bg-transparent',
        )}
      >
        {item.paid && <Check size={14} strokeWidth={3} />}
      </button>
      <button
        className="flex-1 text-left text-sm text-[var(--text)]"
        onClick={() => onOpen(item._id)}
      >
        <span className={cn('truncate', item.paid && 'opacity-50 line-through')}>
          {item.name}
        </span>
      </button>
      <span
        className={cn(
          'shrink-0 text-sm tabular-nums text-[var(--muted-foreground)]',
          item.paid && 'opacity-50',
        )}
      >
        {item.amount && item.amount > 0 ? krw(item.amount) : '—'}
      </span>
    </div>
  )
}
