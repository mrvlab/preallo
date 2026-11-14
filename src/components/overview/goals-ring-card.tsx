'use client'

import { GoalsRings } from './goals-rings'

type Goals = { needs: number; wants: number; savings: number }
type Totals = { needs: number; wants: number; savings: number }

export function GoalsRingCard({ pct, goals }: { pct: Totals; goals: Goals }) {
  const onTarget = (['needs', 'wants', 'savings'] as const).filter((k) => {
    const used = goals[k] > 0 ? pct[k] / goals[k] : 0
    return k === 'savings' ? used >= 0.995 : used <= 1.005
  }).length

  const savingsUsed = goals.savings > 0 ? pct.savings / goals.savings : 0
  const hint =
    savingsUsed < 0.995
      ? 'Close the savings ring. The other two show room left.'
      : onTarget === 3
        ? 'All three on target.'
        : 'Needs or Wants is past its goal. Trim it in Plan.'

  return (
    <section className="flex items-center lg:min-h-[15.5rem] gap-5 rounded-[var(--radius-4)] bg-card px-5 py-5 shadow-[inset_0_0_0_1px_var(--line)] lg:gap-6 lg:px-7 lg:py-[1.65rem]">
      <div className="shrink-0">
        <span className="hidden lg:block">
          <GoalsRings size={195} pct={pct} goals={goals} />
        </span>
        <span className="block lg:hidden">
          <GoalsRings size={120} pct={pct} goals={goals} />
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[0.6875rem] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
          Your goals
        </span>
        <h2 className="text-lg leading-snug font-bold text-[var(--text)]">{onTarget} of 3 on target</h2>
        <p className="text-[0.84rem] leading-snug text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </section>
  )
}
