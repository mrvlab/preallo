import { clerkMiddleware } from '@clerk/nextjs/server'

// Sign-in lives on our own domain so a home-screen launch never leaves the app.
export default clerkMiddleware({ signInUrl: '/sign-in', signUpUrl: '/sign-up' })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
