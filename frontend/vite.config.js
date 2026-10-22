import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O preview do sandbox acessa o dev server por <porta>-<sandbox>.<dominio>.
// Só liberamos esse host quando BASE44_PREVIEW_MODE=1; fora do sandbox a lista
// fica restrita a localhost, mantendo o comportamento original.
const allowedHosts = ['localhost', '127.0.0.1']
if (
  process.env.BASE44_PREVIEW_MODE === '1' &&
  process.env.BASE44_SANDBOX_HOST_DOMAIN
) {
  allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`)
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
