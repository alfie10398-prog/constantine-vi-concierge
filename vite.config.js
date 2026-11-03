import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{output:{entryFileNames:'assets/access.js',chunkFileNames:'assets/[name].js',assetFileNames:'assets/[name][extname]'}}}});
