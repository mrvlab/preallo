import type { MetadataRoute } from 'next'

// Saved to a home screen, Preallo opens full screen on Overview, without browser chrome.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Preallo',
    short_name: 'Preallo',
    description: 'Payday budget, one intentional check-in per month.',
    id: '/',
    start_url: '/overview',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'en',
    categories: ['finance', 'productivity'],
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      // Same Android icon sizes as the v1 manifest.
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
