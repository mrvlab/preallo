import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserFromIdentity } from './users'

export const listForReview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    return await ctx.db
      .query('transactions')
      .withIndex('byUserReview', (q) =>
        q.eq('userId', userId).eq('needsReview', true),
      )
      .collect()
  },
})

export const listForMonth = query({
  args: { monthKey: v.string() },
  handler: async (ctx, { monthKey }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    return await ctx.db
      .query('transactions')
      .withIndex('byUserMonth', (q) =>
        q.eq('userId', userId).eq('monthKey', monthKey),
      )
      .collect()
  },
})

export const upsertBatch = mutation({
  args: {
    rows: v.array(
      v.object({
        date: v.string(),
        monthKey: v.string(),
        description: v.string(),
        amount: v.number(),
        source: v.object({
          file: v.string(),
          sheet: v.string(),
          row: v.number(),
        }),
        bucket: v.optional(v.string()),
        savingsSlug: v.optional(v.string()),
        category: v.optional(v.string()),
        confidence: v.optional(v.number()),
        needsReview: v.boolean(),
      }),
    ),
  },
  returns: v.object({ inserted: v.number(), updated: v.number() }),
  handler: async (ctx, { rows }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    let inserted = 0
    let updated = 0
    for (const r of rows) {
      const existing = await ctx.db
        .query('transactions')
        .withIndex('byUserMonth', (q) =>
          q.eq('userId', userId).eq('monthKey', r.monthKey),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('source.file'), r.source.file),
            q.eq(q.field('source.sheet'), r.source.sheet),
            q.eq(q.field('source.row'), r.source.row),
          ),
        )
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, {
          description: r.description,
          amount: r.amount,
          bucket: r.bucket,
          savingsSlug: r.savingsSlug,
          category: r.category,
          confidence: r.confidence,
          needsReview: r.needsReview,
        })
        updated++
      } else {
        await ctx.db.insert('transactions', {
          userId,
          ...r,
        })
        inserted++
      }
    }
    return { inserted, updated }
  },
})

export const clearImported = mutation({
  args: {},
  returns: v.object({ transactions: v.number(), months: v.number() }),
  handler: async (ctx) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const txns = await ctx.db
      .query('transactions')
      .withIndex('byUserMonth', (q) => q.eq('userId', userId))
      .collect()
    for (const t of txns) await ctx.db.delete(t._id)
    const months = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId))
      .collect()
    let removedMonths = 0
    for (const m of months) {
      if (!m.imported) continue
      const hasItems = await ctx.db
        .query('items')
        .withIndex('byUserMonth', (q) =>
          q.eq('userId', userId).eq('monthKey', m.key),
        )
        .first()
      if (hasItems) continue
      await ctx.db.delete(m._id)
      removedMonths++
    }
    return { transactions: txns.length, months: removedMonths }
  },
})

export const review = mutation({
  args: {
    id: v.id('transactions'),
    patch: v.object({
      bucket: v.optional(v.string()),
      savingsSlug: v.optional(v.string()),
      category: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { id, patch }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const row = await ctx.db.get(id)
    if (!row || row.userId !== userId) throw new Error('Not found')
    await ctx.db.patch(id, { ...patch, needsReview: false, confidence: 1 })
    return null
  },
})
