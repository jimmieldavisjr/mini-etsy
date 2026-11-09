import { defineConfig } from 'vitest/config';

// Unit tests: domain and use cases, no database.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
  },
});
