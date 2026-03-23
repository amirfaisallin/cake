import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    // Avoid noisy lightningcss warnings for Tailwind v4 directives on Vercel.
    cssMinify: 'esbuild',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, '..'),
      'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
      'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.tsx'),
    },
  },
  publicDir: path.resolve(__dirname, '..', 'public'),
  server: {
    port: 5173,
    proxy: {
      // Keep your existing fetch('/api/...') calls unchanged.
      '/api': 'http://localhost:5000',
    },
    fs: {
      allow: ['..'],
    },
  },
})

