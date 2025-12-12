import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/twitter': {
        target: 'https://api.twitter.com/2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twitter/, ''),
        headers: {
          'Authorization': `Bearer ${process.env.VITE_TWITTER_BEARER_TOKEN}`
        }
      }
    }
  }
})
