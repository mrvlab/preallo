import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'

export const instant = false

export default async function Landing() {
  const { userId } = await auth()
  if (userId) redirect('/overview')

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-[var(--radius-4)] border border-[var(--line)] bg-card p-8 text-center">
        <div
          className="mx-auto mb-6 font-semibold tracking-[0.18em] text-[var(--brand-primary)]"
          style={{ fontSize: 18 }}
        >
          PREALLO
        </div>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Payday budget. One intentional check-in per month.
        </p>
        <SignInButton mode="modal">
          <button className="h-10 w-full rounded-[var(--radius-3)] bg-[var(--brand-primary)] px-5 text-sm font-medium text-white">
            Sign in
          </button>
        </SignInButton>
      </div>
    </main>
  )
}
