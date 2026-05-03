import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // NOTE: basicSsl intentionally removed.
    // Browsers treat plain http://localhost as a "secure context" — Geolocation
    // and Service Workers work without HTTPS on localhost.  The self-signed cert
    // from basicSsl is what caused "SSL certificate error" SW registration failures.
    // For LAN testing on a real device use mkcert (see README).
  ],
  server: {
    host: true,   // Expose on all interfaces so you can test on LAN devices via http://
    // https: true  ← REMOVED: self-signed SSL breaks SW registration in all browsers
    //               For LAN HTTPS, install mkcert and set https: { key, cert } instead.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true, // IMPORTANT: Support WebSocket upgrades
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
        }
      }
    }
  }
})
