import { defineConfig } from 'vite';

// base './' é necessário para o build funcionar dentro do WebView do Capacitor
export default defineConfig({
  base: './',
  build: { outDir: 'dist' },
  server: { host: true },
});
