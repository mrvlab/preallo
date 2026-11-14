import { query } from './_generated/server'
import { getUserFromIdentity } from './users'

type Bucket = 'needs' | 'wants' | 'savings'
type Stats = { median: number; mean: number; p25: number; p75: number }

function statsOf(values: number[]): Stats {
  if (values.length === 0) return { median: 0, mean: 0, p25: 0, p75: 0 }
  const sorted = [...values].sort((a, b) => a - b)
  const pick = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length
  return { median: pick(0.5), mean, p25: pick(0.25), p75: pick(0.75) }
}

export const computeActualAverages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return null

    const months = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId))
      .collect()

    const importedMonths = months.filter((m) => m.imported)
    if (importedMonths.length === 0)
      return {
        months: 0,
        stats: null,
        savingsStats: null,
        monthlySpend: 0,
      }

    const ratios: Record<Bucket, number[]> = {
      needs: [],
      wants: [],
      savings: [],
    }
    const savingsRatios: Record<string, number[]> = {
      investment: [],
      travel: [],
      emergency: [],
    }

    const spends: number[] = []

    for (const m of importedMonths) {
      if (!m.income || m.income <= 0) continue
      const txns = await ctx.db
        .query('transactions')
        .withIndex('byUserMonth', (q) =>
          q.eq('userId', userId).eq('monthKey', m.key),
        )
        .collect()
      const sums: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
      const savingsSums: Record<string, number> = {
        investment: 0,
        travel: 0,
        emergency: 0,
      }
      for (const t of txns) {
        if (!t.bucket || t.amount >= 0) continue
        const abs = Math.abs(t.amount)
        if (t.bucket === 'needs' || t.bucket === 'wants' || t.bucket === 'savings') {
          sums[t.bucket as Bucket] += abs
        }
        if (t.bucket === 'savings' && t.savingsSlug && t.savingsSlug in savingsSums) {
          savingsSums[t.savingsSlug] += abs
        }
      }
      spends.push(sums.needs + sums.wants)
      for (const b of ['needs', 'wants', 'savings'] as Bucket[]) {
        ratios[b].push(sums[b] / m.income)
      }
      for (const slug of Object.keys(savingsSums)) {
        savingsRatios[slug].push(savingsSums[slug] / m.income)
      }
    }

    const monthlySpend =
      spends.length === 0
        ? 0
        : spends.reduce((a, b) => a + b, 0) / spends.length

    return {
      months: importedMonths.length,
      stats: {
        needs: statsOf(ratios.needs),
        wants: statsOf(ratios.wants),
        savings: statsOf(ratios.savings),
      },
      savingsStats: {
        investment: statsOf(savingsRatios.investment),
        travel: statsOf(savingsRatios.travel),
        emergency: statsOf(savingsRatios.emergency),
      },
      monthlySpend,
    }
  },
})
