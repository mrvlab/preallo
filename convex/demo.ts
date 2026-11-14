import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'

// Throwaway month for eyeballing the UI. Run from the CLI only:
//   npx convex run demo:seed '{"email":"…","key":"2026-11"}'
//   npx convex run demo:clear '{"email":"…","key":"2026-11"}'
// Both refuse to touch an imported month or a month that was not seeded here.

const DEMO_GROUP_TAG = 'Demo'

const ITEMS: Array<{
  bucket: 'needs' | 'wants' | 'savings'
  name: string
  category: string
  amount: number
  due?: number
  paid?: boolean
  locked?: boolean
  savingsSlug?: string
}> = [
  { bucket: 'needs', name: 'Rent', category: 'Home', amount: 9800, due: 1, paid: true, locked: true },
  { bucket: 'needs', name: 'Electricity', category: 'Home', amount: 640, due: 5, paid: true },
  { bucket: 'needs', name: 'Phone plan', category: 'Home', amount: 299, due: 10 },
  { bucket: 'needs', name: 'CSN', category: 'Debt', amount: 1430, due: 14, locked: true },
  { bucket: 'needs', name: 'Car loan', category: 'Debt', amount: 2850, due: 20, locked: true },
  { bucket: 'needs', name: 'Groceries', category: 'Food', amount: 4000 },
  { bucket: 'wants', name: 'Gym', category: 'Fun', amount: 449, due: 3, paid: true },
  { bucket: 'wants', name: 'Spotify', category: 'Subscriptions', amount: 129, due: 17, locked: true },
  { bucket: 'wants', name: 'Klarna', category: 'Debt', amount: 1200, due: 25 },
  { bucket: 'wants', name: 'Eating out', category: 'Food', amount: 1500 },
  { bucket: 'savings', name: 'Investment', category: 'Other', amount: 5000, due: 26, savingsSlug: 'investment' },
  { bucket: 'savings', name: 'Travel fund', category: 'Other', amount: 1000, due: 28, savingsSlug: 'travel' },
]

async function userByEmail(ctx: MutationCtx, email: string) {
  const user = (await ctx.db.query('users').collect()).find((u) => u.email === email)
  if (!user) throw new Error(`No user with email ${email}`)
  return user
}

export const seed = internalMutation({
  args: { email: v.string(), key: v.string() },
  handler: async (ctx, { email, key }) => {
    const user = await userByEmail(ctx, email)
    const existing = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', user._id).eq('key', key))
      .unique()
    if (existing) throw new Error(`${key} already exists, clear it first`)
    await ctx.db.insert('months', {
      userId: user._id,
      key,
      income: 36000,
      goals: user.defaultSplit,
      imported: false,
    })
    for (const i of ITEMS) {
      await ctx.db.insert('items', {
        userId: user._id,
        monthKey: key,
        bucket: i.bucket,
        savingsSlug: i.savingsSlug,
        name: i.name,
        category: i.category,
        amount: i.amount,
        due: i.due,
        paid: i.paid ?? false,
        paidAt: i.paid ? Date.now() : undefined,
        locked: i.locked ?? false,
        group: DEMO_GROUP_TAG,
      })
    }
    return { key, items: ITEMS.length }
  },
})

export const clear = internalMutation({
  args: { email: v.string(), key: v.string() },
  handler: async (ctx, { email, key }) => {
    const user = await userByEmail(ctx, email)
    const month = await ctx.db
      .query('months')
      .withIndex('byUserKey', (q) => q.eq('userId', user._id).eq('key', key))
      .unique()
    if (!month) return { removed: 0 }
    if (month.imported) throw new Error(`${key} is imported, not a demo month`)
    const items = await ctx.db
      .query('items')
      .withIndex('byUserMonth', (q) => q.eq('userId', user._id).eq('monthKey', key))
      .collect()
    if (items.some((i) => i.group !== DEMO_GROUP_TAG)) {
      throw new Error(`${key} has items that were not seeded here, leaving it alone`)
    }
    for (const i of items) await ctx.db.delete(i._id)
    await ctx.db.delete(month._id)
    return { removed: items.length }
  },
})
