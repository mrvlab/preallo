'use client'

import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { useAuth } from '@clerk/nextjs'
import { api } from '../../convex/_generated/api'

export function UserBootstrap() {
  const { isSignedIn, isLoaded } = useAuth()
  const ensureUser = useMutation(api.users.ensureUser)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    ensureUser({}).catch((err) => console.error('ensureUser failed', err))
  }, [isLoaded, isSignedIn, ensureUser])

  return null
}
