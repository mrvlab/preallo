'use client'

import { krw } from '@/lib/format'

type Item = {
  _id: string
  name: string
  amount?: number
  due?: number
  bucket: string
  paid: boolean
}

type Props = { items: Item[] }

export function ComingUp({ items }: Props) {
  const unpaid = items
    .filter((i) => !i.paid && i.amount && i.amount > 0)
    .sort((a, b) => (a.due ?? 99) - (b.due ?? 99))
    .slice(0, 5)
  const total = unpaid.reduce((a, i) => a + (i.amount ?? 0), 0)

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted-foreground)]">
          COMING UP
        </div>
        <div className="text-sm font-semibold tabular-nums text-[var(--text)]">
          {krw(total)}
        </div>
      </div>
      {unpaid.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Nothing pencilled in. Items with amounts show here.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {unpaid.map((i) => (
            <li
              key={i._id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-[var(--text)]">
                <i
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `var(--${i.bucket})` }}
                />
                <span className="truncate">{i.name}</span>
              </span>
              <span className="tabular-nums text-[var(--muted-foreground)]">
                {i.due ? `${i.due}.` : ''} {krw(i.amount ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
