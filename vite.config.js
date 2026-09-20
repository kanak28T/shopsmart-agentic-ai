import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forward /api/* to the FastAPI backend on port 8000.
      // This means agentService.js can use fetch('/api/recommend') without
      // any CORS issues in development.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Strip the /api prefix before forwarding: /api/recommend → /recommend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
