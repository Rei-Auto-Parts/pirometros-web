import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Em desenvolvimento, `/api` vai para a API (que roda fora deste compose, via `make run` do
// repositório pirometros-api). Em produção quem faz esse papel é o nginx.
const apiProxyTarget = process.env['API_PROXY_TARGET'] ?? 'http://host.docker.internal:8000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
  server: { port: 5173, proxy: { '/api': { target: apiProxyTarget, changeOrigin: true } } },
});
