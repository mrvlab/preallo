'use client'

import { FileDrop } from '@/components/import/file-drop'
import { ReviewQueue } from '@/components/import/review-queue'

export default function ImportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-5 md:p-8">
      <h1 className="mb-2 text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
        Historical import
      </h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        Drop your old Excel-exported budget CSVs. Rows go into transactions,
        categorised by rules, with low-confidence rows flagged for review.
      </p>
      <div className="flex flex-col gap-6">
        <FileDrop />
        <ReviewQueue />
      </div>
    </div>
  )
}
