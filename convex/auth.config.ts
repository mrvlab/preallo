export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        'https://sacred-drake-6889.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
}
