import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { inspectAttr } from 'kimi-plugin-inspect-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
