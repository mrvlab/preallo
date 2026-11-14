'use client'

import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { Slider } from '@/components/ui/slider'
import { SectionCard } from './section-card'
import { api } from '../../../convex/_generated/api'

type Split = { needs: number; wants: number; savings: number }

export function DefaultSplitCard({ initial }: { initial: Split }) {
  const update = useMutation(api.users.updateDefaultSplit)
  const [split, setSplit] = useState<Split>(initial)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setSplit(initial)
    setDirty(false)
  }, [initial.needs, initial.wants, initial.savings])

  function change(key: keyof Split, value: number) {
    const others: Array<keyof Split> = ['needs', 'wants', 'savings']
    const otherKeys = others.filter((k) => k !== key)
    const otherTotal = 100 - value
    const otherSum = otherKeys.reduce((a, k) => a + split[k], 0)
    const next: Split = { ...split, [key]: value }
    if (otherSum > 0) {
      otherKeys.forEach((k) => {
        next[k] = Math.round((split[k] / otherSum) * otherTotal)
      })
    } else {
      otherKeys.forEach((k) => (next[k] = Math.round(otherTotal / 2)))
    }
    const total = next.needs + next.wants + next.savings
    if (total !== 100) next[otherKeys[0]] += 100 - total
    setSplit(next)
    setDirty(true)
  }

  async function save() {
    await update({ split })
    setDirty(false)
  }

  return (
    <SectionCard
      title="Default split"
      description="Applied to new months going forward."
    >
      {(['needs', 'wants', 'savings'] as Array<keyof Split>).map((k) => (
        <div key={k} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="capitalize" style={{ color: `var(--${k}-ink)` }}>
              {k}
            </span>
            <span className="tabular-nums text-[var(--text)]">{split[k]}%</span>
          </div>
          <Slider
            value={[split[k]]}
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
