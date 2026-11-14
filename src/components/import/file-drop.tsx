'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useMutation } from 'convex/react'
import { Upload } from 'lucide-react'
import { runParsers } from '@/lib/parsers/registry'
import { classify } from '@/lib/categorise/apply'
import { api } from '../../../convex/_generated/api'

type LogEntry = {
  file: string
  status: 'ok' | 'skipped'
  monthKey?: string
  parser?: string
  inserted?: number
  updated?: number
  reason?: string
  flagged?: number
}

export function FileDrop() {
  const upsert = useMutation(api.transactions.upsertBatch)
  const ensureMonth = useMutation(api.months.ensureImportedMonth)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])

  async function handleFiles(files: FileList) {
    setBusy(true)
    const entries: LogEntry[] = []
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        entries.push({
          file: file.name,
          status: 'skipped',
          reason: 'Not a .csv file',
        })
        continue
      }
      const text = await file.text()
      const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false })
      const rows = (parsed.data ?? []).filter((r) =>
        Array.isArray(r),
      ) as string[][]
      const result = runParsers(file.name, rows)
      if (result.status === 'skipped') {
        entries.push({
          file: file.name,
          status: 'skipped',
          reason: result.reason,
        })
        continue
      }
      const classified = result.rows.map((r) => {
        const c = classify(r.description, r.bucketHint)
        return {
          date: r.date,
          monthKey: result.monthKey,
          description: r.description,
          amount: r.amount,
          source: r.source,
          bucket: c.bucket,
          savingsSlug: c.savingsSlug,
          category: c.category,
          confidence: c.confidence,
          needsReview: c.needsReview,
        }
      })
      const salaryGuess = Math.max(
        0,
        ...classified
          .filter((r) => r.amount > 10000)
          .map((r) => r.amount),
      )
      await ensureMonth({
        key: result.monthKey,
        income: salaryGuess,
      })
      const { inserted, updated } = await upsert({ rows: classified })
      const flagged = classified.filter((r) => r.needsReview).length
      entries.push({
        file: file.name,
        status: 'ok',
        monthKey: result.monthKey,
        parser: result.parserSlug,
        inserted,
        updated,
        flagged,
      })
    }
    setLog((prev) => [...entries, ...prev])
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
        }}
        className="flex flex-col items-center gap-2 rounded-[var(--radius-4)] border border-dashed border-[var(--p-16)] bg-[var(--p-04)] p-10 text-center"
      >
        <Upload size={28} className="text-[var(--muted-foreground)]" />
        <p className="text-sm text-[var(--text)]">
          Drop one or more CSV files here
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Files with TEMPLATE in the name are skipped automatically.
        </p>
        <button
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-3 h-9 rounded-[var(--radius-3)] bg-[var(--brand-primary)] px-4 text-sm text-white disabled:opacity-50"
        >
          {busy ? 'Importing…' : 'Choose files'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      {log.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-4">
          <h3 className="pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Import log
          </h3>
          {log.map((e, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-1.5 last:border-b-0 text-sm"
            >
              <span className="flex-1 truncate">
                <span className="text-[var(--text)]">{e.file}</span>
                {e.monthKey && (
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                    {e.monthKey} · {e.parser}
                  </span>
                )}
              </span>
              <span
                className={
                  e.status === 'ok'
                    ? 'text-[var(--ok)] text-xs'
                    : 'text-[var(--warn)] text-xs'
                }
              >
                {e.status === 'ok'
                  ? `${e.inserted} new, ${e.updated} updated, ${e.flagged} to review`
                  : `Skipped: ${e.reason}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
