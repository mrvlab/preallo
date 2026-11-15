import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { getUserFromIdentity } from './users'

// `key` comes from the importer: it knows which fields make a row unique in each export
// (Nordea has a running balance, Resurs and Klarna do not).
const row = v.object({
  date: v.string(),
  amount: v.number(),
  text: v.string(),
  kind: v.optional(v.string()),
  balance: v.optional(v.number()),
  interest: v.optional(v.number()),
  declined: v.optional(v.boolean()),
  note: v.optional(v.string()),
  currency: v.string(),
  key: v.string(),
})

export const list = query({
  args: {
    bank: v.optional(v.string()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, { bank, from, to }) => {
    const userId = await getUserFromIdentity(ctx)
    if (!userId) return []
    const rows = await ctx.db
      .query('bankTransactions')
      .withIndex('byUserDate', (q) => {
        const u = q.eq('userId', userId)
        if (from && to) return u.gte('date', from).lte('date', to)
        if (from) return u.gte('date', from)
        if (to) return u.lte('date', to)
        return u
      })
      .collect()
    return bank ? rows.filter((r) => r.bank === bank) : rows
  },
})

// Run from the CLI until there is an upload in the app.
export const importForUser = internalMutation({
  args: { userId: v.id('users'), bank: v.string(), rows: v.array(row) },
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx, { userId, bank, rows }) => {
    let inserted = 0
    let skipped = 0
    for (const r of rows) {
      const existing = await ctx.db
        .query('bankTransactions')
        .withIndex('byUserKey', (q) => q.eq('userId', userId).eq('key', r.key))
        .first()
      if (existing) {
        skipped++
        continue
      }
      await ctx.db.insert('bankTransactions', { userId, bank, ...r })
      inserted++
    }
    return { inserted, skipped }
  },
})

// Corrects old plan rows with what the bank actually charged: the real date and amount of the
// matching payment. Run from the CLI after matching rows against bank history.
export const applyToPlan = internalMutation({
  args: {
    userId: v.id('users'),
    rows: v.array(
      v.object({ id: v.id('transactions'), date: v.string(), amount: v.number() }),
    ),
  },
  returns: v.number(),
  handler: async (ctx, { userId, rows }) => {
    let patched = 0
    for (const r of rows) {
      const row = await ctx.db.get(r.id)
      if (!row || row.userId !== userId) continue
      await ctx.db.patch(r.id, { date: r.date, amount: r.amount })
      patched++
    }
    return patched
  },
})
