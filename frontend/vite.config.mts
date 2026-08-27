import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0',

    allowedHosts: [
      'ai-ecommerce-laravel.cloudafk.xyz',
    ],

    proxy: {
      '/api': {
        target: 'http://172.17.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})