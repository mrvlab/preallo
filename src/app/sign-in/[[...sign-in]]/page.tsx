import { SignIn } from '@clerk/nextjs'
import { Logo } from '@/components/logo'

// Hosted on our own domain, so signing in from the home-screen app stays inside it.
export default function SignInPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[var(--side)] px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Logo />
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/overview" />
    </main>
  )
}
