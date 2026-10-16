import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// base './' lets the built app work from any folder, including GitHub Pages.
// Two pages: the phone app (index.html) and the desktop Atlas (atlas/index.html).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { rollupOptions: { input: { app: resolve(__dirname, 'index.html'), atlas: resolve(__dirname, 'atlas/index.html') } } },
});
