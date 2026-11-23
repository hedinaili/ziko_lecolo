import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  server: {
    watch: {
      ignored: ['**/.vs/**'],
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/data/**/*.ts'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
