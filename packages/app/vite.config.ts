import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // TypeScript 소스 직접 참조로 빌드 없이 개발 가능
      '@cakeaway/simulation-engine': resolve(__dirname, '../simulation-engine/src/index.ts'),
    },
  },
  optimizeDeps: {
    // simulation-engine이 TypeScript 소스로 참조되므로 pre-bundling에서 제외
    exclude: ['@cakeaway/simulation-engine'],
  },
})
