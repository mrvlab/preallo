import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
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

    let unreviewed = 0
    const fromHistory = items.length === 0 && month.imported
    if (fromHistory) {
      const txns = await ctx.db
        .query('transactions')
        .withIndex('byUserMonth', (q) =>
          q.eq('userId', userId).eq('monthKey', key),
        )
        .collect()
      for (const t of txns) {
        if (t.amount >= 0) continue
        if (t.bucket === 'needs' || t.bucket === 'wants' || t.bucket === 'savings') {
          totals[t.bucket] = r2(totals[t.bucket] + Math.abs(t.amount))
        } else {
          unreviewed++
        }
      }
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

    const paid = items.filter((i) => i.paid).length
    const payable = items.filter((i) => (i.amount ?? 0) > 0).length
    const missing = items.filter((i) => i.amount == null || i.amount === 0).length

    return {
      month,
      fromHistory,
      unreviewed,
      itemCount: items.length,
      paid,
      payable,
      missing,
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

export const bucketHistory = query({
  args: { key: v.string(), bucket: v.string(), months: v.number() },
  handler: async (ctx, { key, bucket, months }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    const all = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId))
      .collect()
    const sorted = all
      .filter((m) => m.key <= key)
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, months)
      .reverse()

    const results: Array<{ key: string; amount: number; goal: number; income: number; goalPct: number }> = []
    for (const m of sorted) {
      const items = await ctx.db
        .query('items')
        .withIndex('byUserMonthBucket', (q) =>
          q
            .eq('userId', userId)
            .eq('monthKey', m.key)
            .eq('bucket', bucket),
        )
        .collect()
      const itemsTotal = items.reduce((a, i) => a + (i.amount ?? 0), 0)

      const txns = await ctx.db
        .query('transactions')
        .withIndex('byUserMonth', (q) =>
          q.eq('userId', userId).eq('monthKey', m.key),
        )
        .collect()
      const txnsTotal = txns
        .filter((t) => t.bucket === bucket && t.amount < 0)
        .reduce((a, t) => a + Math.abs(t.amount), 0)

      const amount = Math.max(itemsTotal, txnsTotal)
      const goalPct = m.goals[bucket as keyof typeof m.goals] || 0
      const goal = (m.income * goalPct) / 100
      results.push({ key: m.key, amount, goal, income: m.income, goalPct })
    }
    return results
  },
})

export const ensureImportedMonth = mutation({
  args: { key: v.string(), income: v.number() },
  returns: v.id('months'),
  handler: async (ctx, { key, income }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const existing = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (existing) {
      if (income > existing.income) {
        await ctx.db.patch(existing._id, { income, imported: true })
      } else {
        await ctx.db.patch(existing._id, { imported: true })
      }
      return existing._id
    }
    const user = await ctx.db.get(userId)
    const goals = user?.defaultSplit ?? { needs: 50, wants: 30, savings: 20 }
    return await ctx.db.insert('months', {
      userId,
      key,
      income,
      goals,
      imported: true,
      closedAt: Date.now(),
    })
  },
})

export const startMonth = mutation({
  args: {
    key: v.string(),
    income: v.number(),
    sourceKey: v.optional(v.string()),
    itemIds: v.array(v.id('items')),
    keepAmounts: v.boolean(),
  },
  returns: v.id('months'),
  handler: async (ctx, { key, income, sourceKey, itemIds, keepAmounts }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const existing = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (existing) throw new Error('Month already exists')
    const user = await ctx.db.get(userId)
    const goals = user?.defaultSplit ?? { needs: 50, wants: 30, savings: 20 }
    const monthId = await ctx.db.insert('months', {
      userId,
      key,
      income,
      goals,
      imported: false,
    })
    for (const id of itemIds) {
      const it = await ctx.db.get(id)
      if (!it || it.userId !== userId || it.monthKey !== sourceKey) continue
      await ctx.db.insert('items', {
        userId,
        monthKey: key,
        bucket: it.bucket,
        savingsSlug: it.savingsSlug,
        name: it.name,
        category: it.category,
        amount: keepAmounts ? it.amount : undefined,
        due: it.due,
        paid: false,
        locked: it.locked,
        group: it.group,
      })
    }
    return monthId
  },
})

export const updateIncome = mutation({
  args: { key: v.string(), income: v.number() },
  returns: v.null(),
  handler: async (ctx, { key, income }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const month = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (!month) throw new Error('Month not found')
    await ctx.db.patch(month._id, { income })
    return null
  },
})

export const updateGoals = mutation({
  args: {
    key: v.string(),
    goals: v.object({
      needs: v.number(),
      wants: v.number(),
      savings: v.number(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { key, goals }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const month = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (!month) throw new Error('Month not found')
    await ctx.db.patch(month._id, { goals })
    return null
  },
})

export const resetMonth = mutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, { key }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const items = await ctx.db
      .query('items')
      .withIndex('byUserMonth', (q) =>
        q.eq('userId', userId).eq('monthKey', key),
      )
      .collect()
    for (const i of items) await ctx.db.delete(i._id)
    return null
  },
})
