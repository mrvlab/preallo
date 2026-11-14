'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { SectionCard } from './section-card'
import { api } from '../../../convex/_generated/api'

export function ResetCard({ monthKey }: { monthKey: string }) {
  const reset = useMutation(api.months.resetMonth)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  async function run() {
    await reset({ key: monthKey })
    setConfirming(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <SectionCard
      title="Reset this month"
      description="Deletes items in this month only. Account and defaults are left alone."
    >
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="h-9 self-start rounded-[var(--radius-3)] border border-[var(--wants-ink)] px-4 text-sm text-[var(--wants-ink)] hover:bg-[var(--wants-soft)]"
        >
          Reset
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={run}
            className="h-9 rounded-[var(--radius-3)] bg-[var(--wants-ink)] px-4 text-sm text-white"
          >
            Confirm reset
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="h-9 rounded-[var(--radius-3)] px-4 text-sm text-[var(--muted-foreground)]"
          >
            Cancel
          </button>
        </div>
      )}
      {done && (
        <span className="text-xs text-[var(--ok)]">Items cleared.</span>
      )}
    </SectionCard>
  )
}
