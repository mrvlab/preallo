import { FormatParser, RawRow, parseKr } from './types'

export const groupASwedishLegend: FormatParser = {
  slug: 'group-a-swedish-legend',
  match: (rows) => {
    const flat = rows
      .slice(0, 20)
      .flat()
      .map((c) => (c ?? '').toString().toLowerCase())
    return (
      flat.includes('vad') &&
      flat.includes('kostnad') &&
      flat.includes('betalsätt')
    )
  },
  parse: (rows, ctx) => {
    const out: RawRow[] = []
    let header: string[] | null = null
    let headerIndex = -1
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].map((c) => (c ?? '').toString().trim().toLowerCase())
      if (
        row.includes('vad') &&
        row.includes('kostnad') &&
        row.includes('betalsätt')
      ) {
        header = row
        headerIndex = i
        break
      }
    }
    if (!header) return out

    const col = (name: string) => header!.indexOf(name)
    const nameCol = col('vad')
    const amtCol = col('kostnad')
    const payCol = col('betalsätt')

    for (let i = headerIndex + 1; i < rows.length; i++) {
      const raw = rows[i]
      const name = (raw[nameCol] ?? '').toString().trim()
      const amtStr = (raw[amtCol] ?? '').toString().trim()
      if (!name || !amtStr) continue
      const amount = parseKr(amtStr)
      if (!amount) continue
      const bucketHint = guessBucket(name, (raw[payCol] ?? '').toString())
      out.push({
        date: `${ctx.monthKey}-01`,
        description: name,
        amount: -Math.abs(amount),
        bucketHint,
        source: { file: ctx.file, sheet: ctx.monthKey, row: i + 1 },
      })
    }
    return out
  },
}

function guessBucket(
  name: string,
  _pay: string,
): 'needs' | 'wants' | 'savings' | undefined {
  const n = name.toLowerCase()
  if (/hyra|el |vatten|bredband|fiber|sl-?kort|resekort/.test(n))
    return 'needs'
  if (/spar|avanza|nordnet|investment|invest/.test(n)) return 'savings'
  return undefined
}
