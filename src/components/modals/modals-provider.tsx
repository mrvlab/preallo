'use client'

import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useMonth } from '@/components/month-context'
import { ItemModal, type ItemTarget } from './item-modal'
import { IncomeModal } from './income-modal'
import { MonthGoalsModal } from './month-goals-modal'
import { MonthPickerModal } from './month-picker-modal'
import { DefaultSalaryModal } from './default-salary-modal'
import { NewMonthFlow } from './new-month-flow'
import { shiftKey } from '@/lib/months'

type Modals = {
  openItem: (target: ItemTarget) => void
  openIncome: () => void
  openGoals: () => void
  openDefaultSalary: () => void
  openPicker: () => void
  startMonth: (key?: string) => void
}

const Ctx = createContext<Modals | null>(null)

export function ModalsProvider({ children }: { children: ReactNode }) {
  const { monthKey, setMonthKey } = useMonth()
  const summary = useQuery(api.months.summary, { key: monthKey })
  const months = useQuery(api.months.listForUser)
  const me = useQuery(api.users.me)

  const [item, setItem] = useState<ItemTarget | null>(null)
  const [income, setIncome] = useState(false)
  const [goals, setGoals] = useState(false)
  const [defaultSalary, setDefaultSalary] = useState(false)
  const [picker, setPicker] = useState(false)
  const [flowKey, setFlowKey] = useState<string | null>(null)

  const monthKeys = useMemo(() => (months ?? []).map((m) => m.key), [months])
  const existing = useMemo(() => new Set(monthKeys), [monthKeys])
  const latest = monthKeys.length ? monthKeys.slice().sort().at(-1)! : monthKey

  const api_: Modals = {
    openItem: setItem,
    openIncome: () => setIncome(true),
    openGoals: () => setGoals(true),
    openDefaultSalary: () => setDefaultSalary(true),
    openPicker: () => setPicker(true),
    startMonth: (key) => setFlowKey(key ?? shiftKey(latest, 1)),
  }

  return (
    <Ctx.Provider value={api_}>
      {children}
      <ItemModal target={item} monthKey={monthKey} onClose={() => setItem(null)} />
      <IncomeModal
        open={income}
        monthKey={monthKey}
        income={summary?.income ?? 0}
        onClose={() => setIncome(false)}
      />
      <MonthGoalsModal
        open={goals}
        monthKey={monthKey}
        goals={summary?.goals ?? { needs: 50, wants: 30, savings: 20 }}
        income={summary?.income ?? 0}
        onClose={() => setGoals(false)}
      />
      <DefaultSalaryModal
        open={defaultSalary}
        salary={me?.defaultSalary ?? 0}
        onClose={() => setDefaultSalary(false)}
      />
      <MonthPickerModal
        open={picker}
        monthKey={monthKey}
        existing={existing}
        onPick={(k) => {
          setMonthKey(k)
          setPicker(false)
        }}
        onStart={(k) => {
          setPicker(false)
          setFlowKey(k)
        }}
        onClose={() => setPicker(false)}
      />
      <NewMonthFlow
        targetKey={flowKey}
        monthKeys={monthKeys}
        defaultSalary={me?.defaultSalary}
        onDone={(k) => {
          setFlowKey(null)
          setMonthKey(k)
        }}
        onClose={() => setFlowKey(null)}
      />
    </Ctx.Provider>
  )
}

export function useModals() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useModals must be used inside ModalsProvider')
  return ctx
}
