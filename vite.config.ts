import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  },
  server: {
    port: 3000,
    host: true
  }
});
