import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserFromIdentity } from './users'

export const listForMonth = query({
  args: { monthKey: v.string() },
  handler: async (ctx, { monthKey }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    return await ctx.db
      .query('items')
      .withIndex('byUserMonth', (q) =>
        q.eq('userId', userId).eq('monthKey', monthKey),
      )
      .collect()
  },
})

export const listForBucket = query({
  args: { monthKey: v.string(), bucket: v.string() },
  handler: async (ctx, { monthKey, bucket }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    return await ctx.db
      .query('items')
      .withIndex('byUserMonthBucket', (q) =>
        q
          .eq('userId', userId)
          .eq('monthKey', monthKey)
          .eq('bucket', bucket),
      )
      .collect()
  },
})

export const create = mutation({
  args: {
    monthKey: v.string(),
    bucket: v.string(),
    name: v.string(),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    due: v.optional(v.number()),
    savingsSlug: v.optional(v.string()),
    locked: v.optional(v.boolean()),
  },
  returns: v.id('items'),
  handler: async (ctx, args) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    return await ctx.db.insert('items', {
      userId,
      monthKey: args.monthKey,
      bucket: args.bucket,
      name: args.name,
      amount: args.amount,
      category: args.category,
      due: args.due,
      savingsSlug: args.savingsSlug,
      paid: false,
      locked: args.locked ?? false,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('items'),
    patch: v.object({
      name: v.optional(v.string()),
      amount: v.optional(v.number()),
      category: v.optional(v.string()),
      due: v.optional(v.number()),
      locked: v.optional(v.boolean()),
      savingsSlug: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { id, patch }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const row = await ctx.db.get(id)
    if (!row || row.userId !== userId) throw new Error('Not found')
    await ctx.db.patch(id, patch)
    return null
  },
})

export const togglePaid = mutation({
  args: { id: v.id('items') },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const row = await ctx.db.get(id)
    if (!row || row.userId !== userId) throw new Error('Not found')
    await ctx.db.patch(id, {
      paid: !row.paid,
      paidAt: row.paid ? undefined : Date.now(),
    })
    return null
  },
})

export const remove = mutation({
  args: { id: v.id('items') },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    const row = await ctx.db.get(id)
    if (!row || row.userId !== userId) throw new Error('Not found')
    await ctx.db.delete(id)
    return null
  },
})
