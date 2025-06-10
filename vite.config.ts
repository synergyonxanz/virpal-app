import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Make environment variables available to the frontend
    'process.env': {}
  },
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist-frontend',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          azure: ['@azure/identity', '@azure/keyvault-secrets'],
          speech: ['microsoft-cognitiveservices-speech-sdk']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false
  },
  preview: {
    port: 5173,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
