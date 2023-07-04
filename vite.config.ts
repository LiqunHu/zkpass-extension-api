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
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/css/i.test(extType)) {
            extType = 'css';
          } else if (/ttf/i.test(extType)) {
            extType = 'fonts';
          } else if (/ttf/i.test(extType)) {
            extType = 'media';
          }
          return `static/${extType}/[name][extname]`;
        },
      }
    }
  }
})
