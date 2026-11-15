'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useQuery } from '@/lib/use-query'
import { api } from '../../convex/_generated/api'
import { budgetMonthKey, DEFAULT_PAYDAY, isEditable } from '@/lib/months'

const STORAGE_KEY = 'preallo.month'

type MonthCtx = {
  monthKey: string
  editable: boolean
  // False until the month list has loaded and monthKey points at a month that exists (or there are none),
  // so pages show skeletons instead of flashing an empty state for a month about to be swapped out.
  ready: boolean
  setMonthKey: (key: string) => void
  // Day salary arrives, and the budget month today falls in (before payday, last month's).
  payday: number
  todayKey: string
}

const Ctx = createContext<MonthCtx | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const me = useQuery(api.users.me)
  const payday = me?.payday ?? DEFAULT_PAYDAY
  const todayKey = budgetMonthKey(payday)
  const [monthKey, setKey] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const months = useQuery(api.months.listForUser)
  // Until a month is restored or picked, follow today's budget month, which needs the payday.
  const shownKey = monthKey ?? todayKey

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved && /^\d{4}-\d{2}$/.test(saved)) setKey(saved)
    } catch {}
    setRestored(true)
  }, [])

  // The current month may not be started yet; open the latest month that exists instead.
  // Only for the landing month: a month just picked or just started can lag the list.
  const [picked, setPicked] = useState(false)
  useEffect(() => {
    if (picked || me === undefined || !months || months.length === 0) return
    if (months.some((m) => m.key === shownKey)) return
    setKey(months.map((m) => m.key).sort().at(-1)!)
  }, [months, shownKey, picked, me])

  const ready =
    restored &&
    me !== undefined &&
    months !== undefined &&
    (picked || months.length === 0 || months.some((m) => m.key === shownKey))

  function setMonthKey(key: string) {
    setPicked(true)
    setKey(key)
    try {
      sessionStorage.setItem(STORAGE_KEY, key)
    } catch {}
  }

  return (
    <Ctx.Provider
      value={{ monthKey: shownKey, editable: isEditable(shownKey, todayKey), ready, setMonthKey, payday, todayKey }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useMonth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMonth must be used inside MonthProvider')
  return ctx
}
