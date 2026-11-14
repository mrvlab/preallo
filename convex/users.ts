import { v } from 'convex/values'
import { mutation, query, QueryCtx, MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

const DEFAULT_SPLIT = { needs: 50, wants: 30, savings: 20 }
const DEFAULT_BREAKDOWN = [
  { slug: 'investment', label: 'Investment', percent: 60 },
  { slug: 'travel', label: 'Travel fund', percent: 25 },
  { slug: 'emergency', label: 'Emergency fund', percent: 15 },
]

function currentMonthKey() {
  const d = new Date()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${m}`
}

export async function getUserFromIdentity(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  const row = await ctx.db
    .query('users')
    .withIndex('byClerk', (q) => q.eq('clerkId', identity.subject))
    .unique()
  return row?._id ?? null
}

export const ensureUser = mutation({
  args: {},
  returns: v.id('users'),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('users')
      .withIndex('byClerk', (q) => q.eq('clerkId', identity.subject))
      .unique()
    if (existing) return existing._id

    const userId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email ?? '',
      name: identity.name ?? identity.givenName ?? '',
      defaultCurrency: 'SEK',
      defaultSplit: DEFAULT_SPLIT,
      savingsBreakdown: DEFAULT_BREAKDOWN,
    })

    const key = currentMonthKey()
    const existingMonth = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', key))
      .unique()
    if (!existingMonth) {
      await ctx.db.insert('months', {
        userId,
        key,
        income: 0,
        goals: DEFAULT_SPLIT,
        imported: false,
      })
    }
    return userId
  },
})

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const row = await ctx.db
      .query('users')
      .withIndex('byClerk', (q) => q.eq('clerkId', identity.subject))
      .unique()
    return row
  },
})

export const updateDefaultSplit = mutation({
  args: {
    split: v.object({
      needs: v.number(),
      wants: v.number(),
      savings: v.number(),
    }),
    savingsBreakdown: v.optional(
      v.array(
        v.object({
          slug: v.string(),
          label: v.string(),
          percent: v.number(),
          target: v.optional(v.number()),
        }),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { split, savingsBreakdown }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) throw new Error('Not authenticated')
    await ctx.db.patch(userId, {
      defaultSplit: split,
      ...(savingsBreakdown ? { savingsBreakdown } : {}),
    })
    return null
  },
})
