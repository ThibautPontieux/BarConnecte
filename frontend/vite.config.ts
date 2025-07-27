import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/admin': {
        target: 'https://localhost:8080', // URL de ton API Admin
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/admin/, '/admin')
      },
      '/api/public': {
        target: 'https://localhost:8090', // URL de ton API Public
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/public/, '/public')
      }
    }
  }
});
