import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative asset paths so the build works under any subpath (e.g. GitHub Pages project sites)
  plugins: [react()],
})
