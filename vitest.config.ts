import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    // Matches the Nuxt auto-import config adopted in #23:
    // components: [{ path: '~/components', pathPrefix: false }]
    Components({
      dirs: ['app/components'],
      directoryAsNamespace: false,
      dts: false
    })
  ],
  test: {
    environment: 'happy-dom',
    pool: 'vmThreads',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**/*.{ts,vue}']
    }
  }
})
