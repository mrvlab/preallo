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
  readOnly?: boolean
  onOpen: (id: Id<'items'>) => void
}

export function TodoRow({ item, readOnly, onOpen }: Props) {
  const toggle = useMutation(api.items.togglePaid)
  return (
    <div className="flex min-h-12 items-center gap-3 border-t border-[var(--line)] px-3 py-1 transition-colors duration-[120ms] first:border-t-0 hover:bg-[var(--p-04)]">
      <button
        aria-label={item.paid ? `Mark ${item.name} unpaid` : `Mark ${item.name} paid`}
        aria-pressed={item.paid}
        disabled={readOnly}
        onClick={() => toggle({ id: item._id })}
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] disabled:pointer-events-none transition-all duration-200 ease-[cubic-bezier(.3,1.6,.5,1)]',
          item.paid
            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--primary-foreground)]'
            : 'border-[var(--p-60)] bg-card hover:border-[var(--text)] hover:bg-[var(--p-04)]',
        )}
      >
        <Check
          strokeWidth={3}
          className={cn(
            'size-[0.8125rem] transition-transform duration-[250ms] ease-[cubic-bezier(.3,1.8,.5,1)]',
            item.paid ? 'scale-100' : 'scale-0',
          )}
        />
      </button>
      <button
        disabled={readOnly}
        onClick={() => onOpen(item._id)}
        className={cn(
          'min-w-0 flex-1 py-2 text-left text-[0.9375rem] leading-5 font-medium [overflow-wrap:break-word]',
          item.paid
            ? 'text-[var(--muted-foreground)] line-through decoration-[var(--p-16)]'
            : 'text-[var(--text)]',
        )}
      >
        {item.name}
      </button>
      <button
        disabled={readOnly}
        onClick={() => onOpen(item._id)}
        className={cn(
          'shrink-0 rounded-[var(--radius-2)] px-2 py-1.5 text-sm font-semibold tabular-nums transition-colors duration-[120ms] hover:bg-[var(--p-06)]',
          item.amount ? (item.paid ? 'text-[var(--muted-foreground)]' : 'text-[var(--text)]') : 'text-[var(--brand-primary)]',
        )}
      >
        {item.amount ? krw(item.amount) : 'Add amount'}
      </button>
    </div>
  )
}
