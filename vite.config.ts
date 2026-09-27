import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/Billr/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be disabled with DISABLE_HMR for environments that do not support file watching.
      // File watching is disabled when HMR is turned off.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when HMR is disabled.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
