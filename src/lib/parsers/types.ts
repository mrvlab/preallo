export type RawRow = {
  date: string
  description: string
  amount: number
  bucketHint?: 'needs' | 'wants' | 'savings'
  paid?: boolean
  source: { file: string; sheet: string; row: number }
}

export type FormatParser = {
  slug: string
  match: (rows: string[][]) => boolean
  parse: (rows: string[][], ctx: { file: string; monthKey: string }) => RawRow[]
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

export function parseKr(input: string): number {
  if (!input) return 0
  const s = input.replace(/kr/gi, '').trim()
  if (s.includes(',') && !s.includes('.')) {
    return Number(s.replace(/\s/g, '').replace(',', '.')) || 0
  }
  return Number(s.replace(/[\s,]/g, '')) || 0
}
