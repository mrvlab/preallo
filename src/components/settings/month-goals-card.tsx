'use client'

import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { Slider } from '@/components/ui/slider'
import { SectionCard } from './section-card'
import { api } from '../../../convex/_generated/api'

type Goals = { needs: number; wants: number; savings: number }

export function MonthGoalsCard({
  monthKey,
  monthLabel,
  initialGoals,
}: {
  monthKey: string
  monthLabel: string
  initialGoals: Goals
}) {
  const update = useMutation(api.months.updateGoals)
  const [goals, setGoals] = useState<Goals>(initialGoals)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setGoals(initialGoals)
    setDirty(false)
  }, [initialGoals.needs, initialGoals.wants, initialGoals.savings])

  function change(key: keyof Goals, value: number) {
    const others: Array<keyof Goals> = ['needs', 'wants', 'savings']
    const otherKeys = others.filter((k) => k !== key)
    const otherTotal = 100 - value
    const otherSum = otherKeys.reduce((a, k) => a + goals[k], 0)
    const next: Goals = { ...goals, [key]: value }
    if (otherSum > 0) {
      otherKeys.forEach((k) => {
        next[k] = Math.round((goals[k] / otherSum) * otherTotal)
      })
    } else {
      otherKeys.forEach((k) => (next[k] = Math.round(otherTotal / 2)))
    }
    const total = next.needs + next.wants + next.savings
    if (total !== 100) {
      const diff = 100 - total
      next[otherKeys[0]] += diff
    }
    setGoals(next)
    setDirty(true)
  }

  async function save() {
    await update({ key: monthKey, goals })
    setDirty(false)
  }

  return (
    <SectionCard
      title={`${monthLabel} goals`}
      description="Percentages must add to 100."
    >
      {(['needs', 'wants', 'savings'] as Array<keyof Goals>).map((k) => (
        <div key={k} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span
              className="capitalize"
              style={{ color: `var(--${k}-ink)` }}
            >
              {k}
            </span>
            <span className="tabular-nums text-[var(--text)]">{goals[k]}%</span>
          </div>
          <Slider
            value={[goals[k]]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => change(k, v[0])}
          />
        </div>
      ))}
      {dirty && (
        <button
          onClick={save}
          className="h-9 self-start rounded-[var(--radius-3)] bg-[var(--brand-primary)] px-4 text-sm text-white"
        >
          Save
        </button>
      )}
    </SectionCard>
  )
}
