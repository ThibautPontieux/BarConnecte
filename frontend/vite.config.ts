import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api/admin': {
          target: env.VITE_API_ADMIN_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/admin/, '/admin')
        },
        '/api/public': {
          target: env.VITE_API_PUBLIC_URL || 'http://localhost:8090',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/public/, '/public')
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser'
    }
  };
});
