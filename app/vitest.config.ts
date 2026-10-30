import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['adapters/**', 'core/**', 'infra/**'],
      // `ui/` e o codigo-fonte copiado pelo shadcn/ui; o schema e gerado do OpenAPI; o
      // `ioc.init.ts` so liga as pecas (equivalente ao `ioc_init` do padrao).
      exclude: [
        'adapters/presenters/ui/**',
        'adapters/clients/api-schema.d.ts',
        'infra/init/ioc.init.tsx',
      ],
    },
  },
});
