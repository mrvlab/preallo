import { FormatParser, RawRow, parseKr } from './types'

export const groupBTriColumn: FormatParser = {
  slug: 'group-b-tri-column',
  match: (rows) => {
    const joined = rows
      .slice(0, 20)
      .map((r) => r.join('|').toUpperCase())
      .join('\n')
    return (
      joined.includes('NEEDS') &&
      joined.includes('WANTS') &&
      /SAVINGS/i.test(joined)
    )
  },
  parse: (rows, ctx) => {
    const out: RawRow[] = []
    let headerIndex = -1
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const upper = rows[i].map((c) => (c ?? '').toString().toUpperCase())
      if (
        upper.some((c) => c === 'NEEDS') &&
        upper.some((c) => c === 'WANTS') &&
        upper.some((c) => c.startsWith('SAVINGS'))
      ) {
        headerIndex = i
        break
      }
    }
    if (headerIndex === -1) return out
    const headerRow = rows[headerIndex].map((c) =>
      (c ?? '').toString().toUpperCase(),
    )
    const needsCol = headerRow.findIndex((c) => c === 'NEEDS')
    const wantsCol = headerRow.findIndex((c) => c === 'WANTS')
    const savingsCol = headerRow.findIndex((c) => c.startsWith('SAVINGS'))

    const groups: Array<{ bucket: 'needs' | 'wants' | 'savings'; col: number }> =
      (
        [
          { bucket: 'needs', col: needsCol },
          { bucket: 'wants', col: wantsCol },
          { bucket: 'savings', col: savingsCol },
        ] as const
      ).filter((g) => g.col >= 0)

    for (let r = headerIndex + 1; r < rows.length; r++) {
      const raw = rows[r]
      for (const [gi, g] of groups.entries()) {
        const name = (raw[g.col] ?? '').toString().trim()
        const amtStr = (raw[g.col + 1] ?? '').toString().trim()
        const paidStr = (raw[g.col + 2] ?? '').toString().trim().toUpperCase()
        if (!name || !amtStr) continue
        const amount = parseKr(amtStr)
        if (!amount) continue
        out.push({
          date: `${ctx.monthKey}-01`,
          description: name,
          amount: -Math.abs(amount),
          bucketHint: g.bucket,
          bucketSure: true,
          paid: paidStr === 'TRUE',
          // One spreadsheet row holds three entries, so the column group is part of the id.
          source: { file: ctx.file, sheet: ctx.monthKey, row: (r + 1) * 10 + gi },
        })
      }
    }
    return out
  },
}
