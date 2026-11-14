'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Input } from '@/components/ui/input'
import { SectionCard } from './section-card'
import { api } from '../../../convex/_generated/api'

export function SalaryCard({
  initialSalary,
  monthKey,
  monthIncome,
}: {
  initialSalary: number | undefined
  monthKey: string
  monthIncome: number
}) {
  const updateSalary = useMutation(api.users.updateDefaultSalary)
  const updateIncome = useMutation(api.months.updateIncome)
  const [salary, setSalary] = useState(initialSalary ?? 0)
  const [income, setIncome] = useState(monthIncome)
  const [dirty, setDirty] = useState(false)

  async function save() {
    await Promise.all([
      updateSalary({ salary }),
      updateIncome({ key: monthKey, income }),
    ])
    setDirty(false)
  }

  return (
    <SectionCard
      title="Salary"
      description="Default used when starting a new month; this month's income is its own number."
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--muted-foreground)]">
          Default salary
        </span>
        <Input
          type="number"
          value={salary || ''}
          onChange={(e) => {
            setSalary(Number(e.target.value))
            setDirty(true)
          }}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--muted-foreground)]">
          This month income
        </span>
        <Input
          type="number"
          value={income || ''}
          onChange={(e) => {
            setIncome(Number(e.target.value))
            setDirty(true)
          }}
        />
      </label>
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
