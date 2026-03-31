import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: vite-plugin-pwa will be added in Phase 2 once the core app is stable.
// PWA manifest config is ready and waiting in this comment block:
//
//
// VitePWA({
//   registerType: 'autoUpdate',
//   manifest: {
//     name: 'Family Hub',
//     short_name: 'FamilyHub',
//     description: 'The Lynn family dashboard',
//     theme_color: '#0f1117',
//     background_color: '#0f1117',
//     display: 'standalone',
//     orientation: 'portrait',
//     start_url: '/Family-Hub-App/',
//     icons: [
//       { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
//       { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
//     ]
//   }
// })

export default defineConfig({
  base: '/Family-Hub-App/',
  plugins: [
    react(),
  ]
})
