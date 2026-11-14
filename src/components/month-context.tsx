'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { currentMonthKey } from '@/lib/months'

const STORAGE_KEY = 'preallo.month'

type MonthCtx = { monthKey: string; setMonthKey: (key: string) => void }

const Ctx = createContext<MonthCtx | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [monthKey, setKey] = useState(currentMonthKey)
  const months = useQuery(api.months.listForUser)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved && /^\d{4}-\d{2}$/.test(saved)) setKey(saved)
    } catch {}
  }, [])

  // The current month may not be started yet; open the latest month that exists instead.
  // Only for the landing month: a month just picked or just started can lag the list.
  const [picked, setPicked] = useState(false)
  useEffect(() => {
    if (picked || !months || months.length === 0) return
    if (months.some((m) => m.key === monthKey)) return
    setKey(months.map((m) => m.key).sort().at(-1)!)
  }, [months, monthKey, picked])

  function setMonthKey(key: string) {
    setPicked(true)
    setKey(key)
    try {
      sessionStorage.setItem(STORAGE_KEY, key)
    } catch {}
  }

  return <Ctx.Provider value={{ monthKey, setMonthKey }}>{children}</Ctx.Provider>
}

export function useMonth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMonth must be used inside MonthProvider')
  return ctx
}
