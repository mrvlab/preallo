import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const instant = false

export default async function Landing() {
  const { userId } = await auth()
  redirect(userId ? '/overview' : '/sign-in')
}
