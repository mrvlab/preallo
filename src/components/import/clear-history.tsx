'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useToast } from '@/components/toast'
import { cardClass, cardLabelClass } from '@/components/ui/card-classes'

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
    <section className={cardClass}>
      <span className={cardLabelClass}>Start the import over</span>
      <p className="mt-1 mb-4 text-sm text-[var(--muted-foreground)]">
        Deletes every imported row and the months that only hold imported data. Months you planned by hand stay.
        This cannot be undone.
      </p>
      {confirming ? (
        <div className="flex gap-2">
          <button onClick={run} className="h-10 rounded-[var(--radius-3)] bg-[var(--warn)] px-4 text-sm font-semibold text-white">
            Delete imported history
          </button>
          <button onClick={() => setConfirming(false)} className="h-10 rounded-[var(--radius-3)] px-4 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--p-04)]">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="h-10 rounded-[var(--radius-3)] px-4 text-sm font-semibold text-[var(--warn)] shadow-[inset_0_0_0_1px_var(--warn)] transition-colors duration-[120ms] hover:bg-[var(--needs-soft)]"
        >
          Clear imported history
        </button>
      )}
    </section>
  )
}
