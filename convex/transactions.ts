import { v } from 'convex/values'
import { query } from './_generated/server'
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
