import { auth } from '@clerk/nextjs/server'
import { AppShell } from '@/components/app-shell'
import { UserBootstrap } from '@/components/user-bootstrap'

export const instant = false

export default async function AppGroupLayout({ children }: LayoutProps<'/'>) {
  await auth.protect()
  return (
    <AppShell>
      <UserBootstrap />
      {children}
    </AppShell>
  )
}
