import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['app-icon.jpg', 'icon.svg'],
      manifest: {
        name: '米国株AIニュース',
        short_name: '米国株AI',
        description: '米国株ニュースをAIで分析するPWAアプリ',
        theme_color: '#f0f4f8',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'app-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false
      }
    })
  ],
})
