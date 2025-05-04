import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
//   base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      },
    },
    outDir: 'public',
    assetsDir: './assets',
    sourcemap: true,
  
  },
})