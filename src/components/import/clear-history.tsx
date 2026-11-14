'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useToast } from '@/components/toast'

export function ClearHistory() {
  const clear = useMutation(api.transactions.clearImported)
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)

  async function run() {
    const res = await clear({})
    setConfirming(false)
    toast(`Cleared ${res.transactions} rows and ${res.months} months`)
  }

  return (
    <div className="rounded-[var(--radius-4)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
      <h3 className="text-sm font-semibold text-[var(--text)]">Start the import over</h3>
      <p className="mt-1 mb-3 text-xs text-[var(--muted-foreground)]">
        Deletes every imported row and the months that only hold imported data. Months you planned by hand stay.
        This cannot be undone.
      </p>
      {confirming ? (
        <div className="flex gap-2">
          <button onClick={run} className="h-9 rounded-[var(--radius-3)] bg-[var(--warn)] px-4 text-sm font-medium text-white">
            Delete imported history
          </button>
          <button onClick={() => setConfirming(false)} className="h-9 rounded-[var(--radius-3)] px-4 text-sm text-[var(--muted-foreground)]">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="h-9 rounded-[var(--radius-3)] px-4 text-sm font-medium text-[var(--warn)] shadow-[inset_0_0_0_1px_var(--warn)]"
        >
          Clear imported history
        </button>
      )}
    </div>
  )
}
