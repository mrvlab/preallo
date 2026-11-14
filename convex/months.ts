import { v } from 'convex/values'
import { query } from './_generated/server'
import { getUserFromIdentity } from './users'

type Bucket = 'needs' | 'wants' | 'savings'
const BUCKETS: Bucket[] = ['needs', 'wants', 'savings']

const r2 = (n: number) => Math.round(n * 100) / 100

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    const rows = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId))
      .collect()
    return rows.sort((a, b) => (a.key < b.key ? 1 : -1))
  },
})

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return null
    return await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
  },
})

export const summary = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return null

    const month = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (!month) return null

    const items = await ctx.db
      .query('items')
      .withIndex('byUserMonth', (q) =>
        q.eq('userId', userId).eq('monthKey', key),
      )
      .collect()

    const totals: Record<Bucket, number> = { needs: 0, wants: 0, savings: 0 }
    for (const b of BUCKETS) {
      totals[b] = r2(
        items
          .filter((i) => i.bucket === b)
          .reduce((a, i) => a + (i.amount ?? 0), 0),
      )
    }

    const fixedWants = r2(
      items
        .filter((i) => i.bucket === 'wants' && i.category === 'Subscriptions')
        .reduce((a, i) => a + (i.amount ?? 0), 0),
    )
    const flex = r2(totals.wants - fixedWants)
    const income = month.income || 0
    const reserved = r2(totals.needs + totals.savings + fixedWants)
    const free = r2(income - reserved)
    const left = r2(income - totals.needs - totals.wants - totals.savings)
    const goals = month.goals
    const goalAmt: Record<Bucket, number> = {
      needs: r2((income * goals.needs) / 100),
      wants: r2((income * goals.wants) / 100),
      savings: r2((income * goals.savings) / 100),
    }
    const pct: Record<Bucket, number> = {
      needs: income > 0 ? (totals.needs / income) * 100 : 0,
      wants: income > 0 ? (totals.wants / income) * 100 : 0,
      savings: income > 0 ? (totals.savings / income) * 100 : 0,
    }

    return {
      month,
      itemCount: items.length,
      totals,
      income,
      fixedWants,
      flex,
      reserved,
      free,
      left,
      goals,
      goalAmt,
      pct,
    }
  },
})
