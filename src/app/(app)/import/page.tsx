'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { FileDrop } from '@/components/import/file-drop'
import { ReviewQueue } from '@/components/import/review-queue'
import { ClearHistory } from '@/components/import/clear-history'

export default function ImportPage() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-10 lg:px-7 lg:pt-0">
      <header className="pt-1 pb-5 lg:flex lg:min-h-[4.875rem] lg:items-center lg:pt-6 lg:pb-7">
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="grid size-9 place-items-center rounded-full text-[var(--text)] transition-colors duration-[120ms] hover:bg-[var(--p-06)]"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.03em] text-[var(--text)] lg:text-[2.1rem]">
              Import old sheets
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Drop your old budget sheets, Excel or CSV. Rows are sorted by rules, and the ones the rules
              cannot place wait for you to pick a bucket.
            </p>
          </div>
        </div>
      </header>
      <div className="grid items-start gap-5 @min-[60rem]/main:grid-cols-[672fr_486fr]">
        <FileDrop />
        <div className="flex flex-col gap-5">
          <ReviewQueue />
          <ClearHistory />
        </div>
      </div>
    </div>
  )
}
