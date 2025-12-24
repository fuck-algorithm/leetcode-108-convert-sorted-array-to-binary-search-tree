import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 51439,
    host: true
  },
  base: '/leetcode-108-convert-sorted-array-to-binary-search-tree/'
})
