import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { initViewportScale } from '@/lib/viewport-scale'
import './globals.css'

const viewportScaleScript = `(${initViewportScale})()`

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const description = 'Payday budget, one intentional check-in per month.'

// Absolute URLs for the share image: the real domain in production, the deployment's own
// URL on QA and previews, localhost in dev.
const siteUrl =
  process.env.VERCEL_ENV === 'production'
    ? 'https://www.preallo.com'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Preallo', template: '%s · Preallo' },
  description,
  openGraph: { type: 'website', siteName: 'Preallo', title: 'Preallo', description },
  twitter: { card: 'summary_large_image', title: 'Preallo', description },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: viewportScaleScript }} />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
