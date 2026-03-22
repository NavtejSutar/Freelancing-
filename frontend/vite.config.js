import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In local dev: /api → http://localhost:8090/api
      // In production: VITE_API_URL is set to the Render backend URL
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
})