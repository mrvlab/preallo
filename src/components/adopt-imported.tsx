'use client'

import { useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { useQuery } from '@/lib/use-query'
import { api } from '../../convex/_generated/api'
import { useMonth } from '@/components/month-context'

// Imported months inside the edit window (last month and later) should be editable like any
// other month, so their sheet rows are turned into items the first time the month is shown.
export function AdoptImported() {
  const { monthKey, editable, ready } = useMonth()
  const summary = useQuery(api.months.summary, ready && editable ? { key: monthKey } : 'skip')
  const adopt = useMutation(api.months.adoptImported)
  const done = useRef(new Set<string>())

  useEffect(() => {
    if (!summary?.fromHistory || done.current.has(monthKey)) return
    done.current.add(monthKey)
    adopt({ key: monthKey }).catch(() => done.current.delete(monthKey))
  }, [summary?.fromHistory, monthKey, adopt])

  return null
}
