import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react()],
  // skyview is a separate Vercel-deployed subproject; keep it out of the dev server
  server: {
    watch: { ignored: ["**/skyview/**"] },
    fs: { deny: ["**/skyview/**"] },
  },
})
