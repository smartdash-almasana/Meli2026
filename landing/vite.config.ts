import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { assetsDir: 'landing-assets' },
  server: { port: 4173, strictPort: true },
});
