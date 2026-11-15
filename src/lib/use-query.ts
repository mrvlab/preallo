'use client'

import { useConvexAuth, useQuery as useConvexQuery, type OptionalRestArgsOrSkip } from 'convex/react'
import type { FunctionReference, FunctionReturnType } from 'convex/server'

// Convex's useQuery, held back until the Clerk token reaches Convex. Without this, the first
// queries on a reload run signed out, come back empty, and the page flashes its empty state
// between the skeleton and the real data.
export function useQuery<Q extends FunctionReference<'query'>>(
  query: Q,
  ...args: OptionalRestArgsOrSkip<Q>
): FunctionReturnType<Q> | undefined {
  const { isAuthenticated } = useConvexAuth()
  const a = args[0]
  const pass = (isAuthenticated && a !== 'skip' ? [a ?? {}] : ['skip']) as OptionalRestArgsOrSkip<Q>
  return useConvexQuery(query, ...pass)
}
