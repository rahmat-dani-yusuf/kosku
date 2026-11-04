import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'KosKu - Manajemen Kos',
        short_name: 'KosKu',
        description: 'Aplikasi manajemen kos sederhana dan cepat.',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'id',
        theme_color: '#059669',
        background_color: '#059669',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*$/,
            handler: 'NetworkOnly',
            options: { cacheName: 'supabase-network' },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style' || request.destination === 'document' || request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'static-assets', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
})
