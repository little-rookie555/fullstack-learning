import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Tailwind v4 通过 Vite 插件接入，不再需要 postcss.config.js 和 tailwind.config.js
  plugins: [react(), tailwindcss()],
})
