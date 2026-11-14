'use client'

import { krw } from '@/lib/format'

type Props = {
  paidCount: number
  itemCount: number
  planned: number
  goal: number
  pctOfSalary: number
}

export function SideBox({
  paidCount,
  itemCount,
  planned,
  goal,
  pctOfSalary,
}: Props) {
  const rows: Array<[string, string]> = [
    ['Paid', `${paidCount} of ${itemCount}`],
    ['Planned', krw(planned)],
    ['Goal', krw(goal)],
    ['Share of salary', `${Math.round(pctOfSalary)}%`],
  ]
  return (
    <aside className="flex flex-col gap-3 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between">
          <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
          <span className="text-sm font-medium tabular-nums text-[var(--text)]">
            {value}
          </span>
        </div>
      ))}
    </aside>
  )
}
