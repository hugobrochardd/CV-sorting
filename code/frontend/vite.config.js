import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/profile': 'http://localhost:3001',
      '/candidates': 'http://localhost:3001',
    },
  },
});
