import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'extension',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx'),
        content_script: resolve(__dirname, 'src/content/content_script.ts'),
        content: resolve(__dirname, 'src/content/content.tsx'),
        background: resolve(__dirname, 'src/background/index.ts')
      },
      output: {
        chunkFileNames: `static/js/[name].js`,
        entryFileNames: 'static/js/[name].js',
        assetFileNames: `static/media/[name].[ext]`
      }
    }
  }
})
