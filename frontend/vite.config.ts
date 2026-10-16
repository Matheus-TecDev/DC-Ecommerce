import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const API_PADRAO = 'http://localhost:3001';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const alvoDoProxy = env.API_PROXY_TARGET || API_PADRAO;

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: alvoDoProxy,
          changeOrigin: true,
          rewrite: (caminho) => caminho.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
      env: { VITE_API_URL: API_PADRAO },
    },
  };
});
