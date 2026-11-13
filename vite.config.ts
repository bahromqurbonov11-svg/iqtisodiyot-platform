import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

// "single" rejimi butun saytni bitta HTML faylga yig‘adi (namoyish uchun).
// Oddiy "build" esa hostingga joylash uchun dist/ papkasini yaratadi.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
  },
}));
