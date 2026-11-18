import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @/ apunta a src/. Es un módulo ES: no hay __dirname, por eso import.meta.dirname
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
