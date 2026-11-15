import { v } from 'convex/values'
import { query } from './_generated/server'
import { getUserFromIdentity } from './users'
import { lastEditableKey, paydayOf } from './editable'

type Bucket = 'needs' | 'wants' | 'savings'
type Stats = { median: number; mean: number; p25: number; p75: number; trend: -1 | 0 | 1 }

const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']
const SLUGS = ['investment', 'travel', 'emergency'] as const

function statsOf(values: number[]): Stats {
  if (values.length === 0) return { median: 0, mean: 0, p25: 0, p75: 0, trend: 0 }
  const sorted = [...values].sort((a, b) => a - b)
  const pick = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length
  return { median: pick(0.5), mean, p25: pick(0.25), p75: pick(0.75), trend: trendOf(values.slice(-12)) }
}

// Sign of a least-squares slope over the series, ignoring drift under one point of salary a month.
function trendOf(values: number[]): -1 | 0 | 1 {
  const n = values.length
  if (n < 3) return 0
  const mx = (n - 1) / 2
  const my = values.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  values.forEach((y, x) => {
    num += (x - mx) * (y - my)
    den += (x - mx) ** 2
  })
  const slope = num / den
  return Math.abs(slope) < 0.01 ? 0 : slope > 0 ? 1 : -1
}

export const computeActualAverages = query({
  args: { period: v.optional(v.union(v.literal('recent'), v.literal('all'))) },
  handler: async (ctx, { period = 'recent' }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return null

    const all = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId))
      .collect()
    // Imported months, plus planned months once they lock, since both are finished.
    const cutoff = lastEditableKey(await paydayOf(ctx, userId))
    const finished = all
      .filter((m) => m.income > 0 && (m.imported || m.key < cutoff))
      .sort((a, b) => (a.key < b.key ? -1 : 1))
    const used = period === 'recent' ? finished.slice(-12) : finished

    const series: Array<{ key: string; needs: number; wants: number; savings: number; spent: number }> = []
    const bySlug: Record<string, number[]> = { investment: [], travel: [], emergency: [] }

    for (const m of used) {
      const sums: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
      const slugSums: Record<string, number> = { investment: 0, travel: 0, emergency: 0 }
      const add = (bucket: string | undefined, slug: string | undefined, amount: number) => {
        if (bucket !== 'needs' && bucket !== 'wants' && bucket !== 'savings') return
        sums[bucket] += amount
        // Savings go to the investment account unless a row says otherwise.
        if (bucket === 'savings') slugSums[slug && slug in slugSums ? slug : 'investment'] += amount
      }
      const items = await ctx.db
        .query('items')
        .withIndex('byUserMonth', (q) => q.eq('userId', userId).eq('monthKey', m.key))
        .collect()
      if (items.length > 0) {
        for (const i of items) add(i.bucket, i.savingsSlug, i.amount ?? 0)
      } else {
        const txns = await ctx.db
          .query('transactions')
          .withIndex('byUserMonth', (q) => q.eq('userId', userId).eq('monthKey', m.key))
          .collect()
        for (const t of txns) if (t.amount < 0) add(t.bucket, t.savingsSlug, Math.abs(t.amount))
      }
      series.push({
        key: m.key,
        needs: sums.needs / m.income,
        wants: sums.wants / m.income,
        savings: sums.savings / m.income,
        spent: sums.needs + sums.wants,
      })
      for (const s of SLUGS) bySlug[s].push(slugSums[s] / m.income)
    }

    const monthlySpend = series.length ? series.reduce((a, s) => a + s.spent, 0) / series.length : 0
    const stats = Object.fromEntries(BUCKETS.map((b) => [b, statsOf(series.map((s) => s[b]))])) as Record<Bucket, Stats>
    const savingsStats = Object.fromEntries(SLUGS.map((s) => [s, statsOf(bySlug[s])])) as Record<string, Stats>

    return {
      months: used.length,
      finishedMonths: finished.length,
      from: used[0]?.key ?? null,
      to: used.at(-1)?.key ?? null,
      overSalary: series.filter((s) => s.needs + s.wants + s.savings > 1).length,
      series: series.slice(-12),
      stats,
      savingsStats,
      monthlySpend,
    }
  },
})
