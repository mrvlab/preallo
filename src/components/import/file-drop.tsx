'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useMutation } from 'convex/react'
import { Upload } from 'lucide-react'
import {
  runParsers,
  runParsersOnSheet,
  type SheetParseResult,
} from '@/lib/parsers/registry'
import { classify } from '@/lib/categorise/apply'
import { api } from '../../../convex/_generated/api'

type LogEntry = {
  file: string
  sheet?: string
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

  async function processResult(result: SheetParseResult): Promise<LogEntry> {
    if (result.status === 'skipped') {
      return {
        file: result.file,
        sheet: result.sheet,
        status: 'skipped',
        reason: result.reason,
      }
    }
    const classified = result.rows.map((r) => {
      const c =
        r.kind === 'income'
          ? { bucket: undefined, savingsSlug: undefined, category: 'salary', confidence: 1, needsReview: false }
          : classify(r.description, r.bucketHint, r.bucketSure)
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
      ...classified.filter((r) => r.amount > 10000).map((r) => r.amount),
    )
    await ensureMonth({ key: result.monthKey, income: salaryGuess })
    const { inserted, updated } = await upsert({ rows: classified })
    const flagged = classified.filter((r) => r.needsReview).length
    return {
      file: result.file,
      sheet: result.sheet,
      status: 'ok',
      monthKey: result.monthKey,
      parser: result.parserSlug,
      inserted,
      updated,
      flagged,
    }
  }

  async function handleFiles(files: FileList) {
    setBusy(true)
    const entries: LogEntry[] = []
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase()
      if (/template/i.test(file.name)) {
        entries.push({
          file: file.name,
          status: 'skipped',
          reason: 'Template file skipped by name',
        })
        continue
      }
      if (lower.endsWith('.csv')) {
        const text = await file.text()
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: false })
        const rows = (parsed.data ?? []).filter(Array.isArray) as string[][]
        const result = runParsers(file.name, rows)
        entries.push(await processResult(result))
        continue
      }
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(buf, { type: 'array' })
        const anyParsed = wb.SheetNames.some((n) => /^[A-Z]{3}\d{2}$/i.test(n))
        for (const sheetName of wb.SheetNames) {
          const sheet = wb.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            blankrows: false,
            defval: '',
          }) as string[][]
          if (anyParsed && !/^[A-Z]{3}\d{2}$/i.test(sheetName)) {
            entries.push({
              file: file.name,
              sheet: sheetName,
              status: 'skipped',
              reason: 'Not a month tab (expected pattern e.g. OCT26)',
            })
            continue
          }
          const result = runParsersOnSheet(file.name, sheetName, rows)
          entries.push(await processResult(result))
        }
        continue
      }
      entries.push({
        file: file.name,
        status: 'skipped',
        reason: 'Unsupported file type (expected .csv, .xlsx or .xls)',
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
          Drop one or more CSV or XLSX files here
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          XLSX workbooks read only sheets named like OCT26. CSV files are treated as a single month.
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
          accept=".csv,.xlsx,.xls"
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
                {e.sheet && e.sheet !== 'csv' && (
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                    {e.sheet}
                  </span>
                )}
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
