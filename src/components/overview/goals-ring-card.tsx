'use client'

import { GoalsRings } from './goals-rings'

type Goals = { needs: number; wants: number; savings: number }
type Totals = { needs: number; wants: number; savings: number }

type Props = {
  pct: Totals
  goals: Goals
}

export function GoalsRingCard({ pct, goals }: Props) {
  const onTarget = (['needs', 'wants', 'savings'] as const).filter((k) => {
    const used = goals[k] > 0 ? pct[k] / goals[k] : 0
    if (k === 'savings') return used >= 0.995
    return used <= 1.005
  }).length

  const hint = (() => {
    const savingsUsed = goals.savings > 0 ? pct.savings / goals.savings : 0
    if (savingsUsed < 0.995) return 'Close the savings ring. The other two show room left.'
    if (onTarget === 3) return 'All three on target. Payday checkpoint cleared.'
    return 'One or more over the ceiling. Trim from Needs or Wants in Plan.'
  })()

  return (
    <section className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--muted-foreground)]">
          YOUR GOALS
        </span>
        <h2 className="text-[18px] font-semibold text-[var(--text)]">
          {onTarget} of 3 on target
        </h2>
        <p className="text-xs leading-snug text-[var(--muted-foreground)]">
          {hint}
        </p>
      </div>
      <GoalsRings size={120} pct={pct} goals={goals} />
    </section>
  )
}
