import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // jieba-wasm 是 WASM 模块，不能被 Vite 预构建
  optimizeDeps: {
    exclude: ['jieba-wasm'],
  },
  build: {
    target: 'es2020',
  },
})
