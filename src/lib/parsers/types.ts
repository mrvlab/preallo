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

const MONTH_WORDS: Record<string, number> = {
  ...SV_MONTHS,
  january: 1,
  february: 2,
  march: 3,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  october: 10,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  maj: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  okt: 10,
  oct: 10,
  nov: 11,
  dec: 12,
}

// Month keys for every tab of a workbook, in tab order. A tab without its own year
// that comes after December (Budget 2023 ends with a "January") moves to the next year.
export function workbookMonthKeys(file: string, sheets: string[]): Map<string, string | null> {
  const out = new Map<string, string | null>()
  let rollover = 0
  let lastFileYearMonth = 0
  for (const sheet of sheets) {
    const key = monthKeyForSheet(file, sheet)
    if (!key || sheetHasYear(sheet)) {
      out.set(sheet, key)
      continue
    }
    const [y, m] = key.split('-').map(Number)
    if (m < lastFileYearMonth) rollover++
    lastFileYearMonth = m
    out.set(sheet, `${y + rollover}-${String(m).padStart(2, '0')}`)
  }
  return out
}

function sheetHasYear(sheet: string) {
  return /(19|20)\d{2}|(^|[^0-9])\d{2}($|[^0-9])/.test(sheet.replace(/([a-zA-Z])(\d)/g, '$1 $2'))
}

// Workbook tabs are named "Januari", "Feb 24", "OCT26" and so on. The month comes
// from the tab; the year from the tab when it has one, otherwise from the file name.
export function monthKeyForSheet(file: string, sheet: string): string | null {
  const tokens = sheet
    .toLowerCase()
    .replace(/([a-zåäö])(\d)/g, '$1 $2')
    .split(/[^a-zåäö0-9]+/)
    .filter(Boolean)
  const month = tokens.map((t) => MONTH_WORDS[t]).find(Boolean)
  if (!month) return null
  const four = tokens.find((t) => /^(19|20)\d{2}$/.test(t))
  const two = tokens.find((t) => /^\d{2}$/.test(t))
  const fileYear = file.match(/\b(19|20)\d{2}\b/)
  const year = four
    ? Number(four)
    : two
      ? Number(two) < 70
        ? 2000 + Number(two)
        : 1900 + Number(two)
      : fileYear
        ? Number(fileYear[0])
        : null
  if (!year) return null
  return `${year}-${String(month).padStart(2, '0')}`
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
