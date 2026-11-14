import { SignUp } from '@clerk/nextjs'
import { Logo } from '@/components/logo'

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[var(--side)] px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Logo />
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/overview" />
    </main>
  )
}
