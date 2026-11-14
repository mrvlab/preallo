'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { currentMonthKey } from '@/lib/months'

const STORAGE_KEY = 'preallo.month'

type MonthCtx = { monthKey: string; setMonthKey: (key: string) => void }

const Ctx = createContext<MonthCtx | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [monthKey, setKey] = useState(currentMonthKey)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved && /^\d{4}-\d{2}$/.test(saved)) setKey(saved)
    } catch {}
  }, [])

  function setMonthKey(key: string) {
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
