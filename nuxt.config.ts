import tailwindcss from '@tailwindcss/vite'
import { createThemeInitScript } from './app/utils/theme-init-script'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  vite: {
    plugins: [tailwindcss()]
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@vite-pwa/nuxt'],
  app: {
    head: {
      title: 'Dough Notes — Pizza dough calculator',
      meta: [
        { name: 'description', content: 'A baker-focused pizza dough calculator, ready for your next bake.' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [{ innerHTML: createThemeInitScript(), tagPriority: 'critical' }]
    }
  },
  pwa: {
    registerType: 'prompt',
    manifest: {
      name: 'Dough Notes',
      short_name: 'Dough Notes',
      description: 'A baker-focused pizza dough calculator.',
      theme_color: '#f5f2eb',
      background_color: '#f5f2eb',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{css,html,ico,js,png,svg,webmanifest,woff2}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true
    },
    devOptions: { enabled: false }
  },
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/', '/tools/flour-strength', '/tools/tin-mass', '/tools/water-temperature'],
      crawlLinks: true,
      failOnError: true
    }
  }
})
