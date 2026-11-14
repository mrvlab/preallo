export type RawRow = {
  date: string
  description: string
  amount: number
  bucketHint?: 'needs' | 'wants' | 'savings'
  kind?: 'income'
  bucketSure?: boolean
  paid?: boolean
  source: { file: string; sheet: string; row: number }
}

export type FormatParser = {
  slug: string
  match: (rows: string[][]) => boolean
  parse: (rows: string[][], ctx: { file: string; monthKey: string; sheet?: string }) => RawRow[]
}

// Month-year codes like OCT26, SEP26, AUG26 used as Excel sheet names.
const SHEET_MONTH_RE = /^([A-Z]{3})(\d{2})$/
const EN_SHORT_UPPER: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
}

export function monthKeyFromSheetName(name: string): string | null {
  const match = name.toUpperCase().match(SHEET_MONTH_RE)
  if (!match) return null
  const monthNum = EN_SHORT_UPPER[match[1]]
  if (!monthNum) return null
  const n = Number(match[2])
  const year = n < 70 ? 2000 + n : 1900 + n
  return `${year}-${String(monthNum).padStart(2, '0')}`
}

const SV_MONTHS: Record<string, number> = {
  januari: 1,
  februari: 2,
  mars: 3,
  april: 4,
  maj: 5,
  juni: 6,
  juli: 7,
  augusti: 8,
  september: 9,
  oktober: 10,
  november: 11,
  december: 12,
}

const EN_SHORT: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

export function monthKeyFromFilename(name: string): string | null {
  const lower = name.toLowerCase()
  const svMatch = Object.keys(SV_MONTHS).find((m) => lower.includes(m))
  const enMatch = Object.keys(EN_SHORT).find((m) => lower.includes(` ${m}`))
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/)
  const twoDigit = lower.match(/\b(\d{2})\b/)
  if (!svMatch && !enMatch) return null
  const monthNum = svMatch ? SV_MONTHS[svMatch] : EN_SHORT[enMatch!]
  let year: number
  if (yearMatch) year = Number(yearMatch[0])
  else if (twoDigit) {
    const n = Number(twoDigit[1])
    year = n < 70 ? 2000 + n : 1900 + n
  } else {
    return null
  }
  return `${year}-${String(monthNum).padStart(2, '0')}`
}

// The salary sits above the item table as `Lön, <amount>` in every layout seen so far.
export function findSalaryRow(
  rows: string[][],
  limit: number,
): { amount: number; row: number } | null {
  for (let i = 0; i < Math.min(rows.length, limit); i++) {
    const cells = rows[i].map((c) => (c ?? '').toString().trim())
    const idx = cells.findIndex((c) => c.toLowerCase() === 'lön')
    if (idx === -1) continue
    for (let j = idx + 1; j < cells.length; j++) {
      const amount = parseKr(cells[j])
      if (amount > 0) return { amount, row: i + 1 }
    }
  }
  return null
}

export function parseKr(input: string): number {
  if (!input) return 0
  const s = input.replace(/kr/gi, '').trim()
  if (s.includes(',') && !s.includes('.')) {
    return Number(s.replace(/\s/g, '').replace(',', '.')) || 0
  }
  return Number(s.replace(/[\s,]/g, '')) || 0
}
