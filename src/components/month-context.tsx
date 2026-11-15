'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useQuery } from '@/lib/use-query'
import { api } from '../../convex/_generated/api'
import { currentMonthKey, isEditable } from '@/lib/months'

const STORAGE_KEY = 'preallo.month'

type MonthCtx = {
  monthKey: string
  editable: boolean
  // False until the month list has loaded and monthKey points at a month that exists (or there are none),
  // so pages show skeletons instead of flashing an empty state for a month about to be swapped out.
  ready: boolean
  setMonthKey: (key: string) => void
}

const Ctx = createContext<MonthCtx | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [monthKey, setKey] = useState(currentMonthKey)
  const [restored, setRestored] = useState(false)
  const months = useQuery(api.months.listForUser)

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
    if (picked || !months || months.length === 0) return
    if (months.some((m) => m.key === monthKey)) return
    setKey(months.map((m) => m.key).sort().at(-1)!)
  }, [months, monthKey, picked])

  const ready =
    restored && months !== undefined && (picked || months.length === 0 || months.some((m) => m.key === monthKey))

  function setMonthKey(key: string) {
    setPicked(true)
    setKey(key)
    try {
      sessionStorage.setItem(STORAGE_KEY, key)
    } catch {}
  }

  return (
    <Ctx.Provider value={{ monthKey, editable: isEditable(monthKey), ready, setMonthKey }}>{children}</Ctx.Provider>
  )
}

export function useMonth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMonth must be used inside MonthProvider')
  return ctx
}
