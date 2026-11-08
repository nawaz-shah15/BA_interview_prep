import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site be hosted from any sub-folder (GitHub Pages, Netlify, S3 ...)
export default defineConfig({
  base: './',
  plugins: [react()],
});
