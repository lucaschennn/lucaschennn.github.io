// Builds the site's code (../../src) into skyview/public/preview with the site's own
// toolchain: run with the repo root's Vite, and resolve React from the root node_modules
// so the preview uses exactly the site's React, not skyview's.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const fromRoot = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const outDir = fromRoot('skyview/public/preview')

// The site's public/ is mostly v1 leftovers (public/images, ~59MB, unused). Copy only
// what src/ references. Add folders here if the site starts using more of public/.
const SITE_PUBLIC = ['icons']

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/preview/',
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'copy-site-public',
      writeBundle() {
        for (const dir of SITE_PUBLIC) cpSync(fromRoot(`public/${dir}`), `${outDir}/${dir}`, { recursive: true })
      },
    },
  ],
  resolve: {
    alias: {
      react: fromRoot('node_modules/react'),
      'react-dom': fromRoot('node_modules/react-dom'),
    },
  },
  build: { outDir, emptyOutDir: true },
})
