import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `VITE_BASE` é definido no CI (GitHub Pages) com o caminho do repositório.
// Localmente e em outros hosts, o padrão é a raiz.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
})
