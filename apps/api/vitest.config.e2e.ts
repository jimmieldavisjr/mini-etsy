import { defineConfig } from 'vitest/config';

// End-to-end tests: the full app over HTTP against a fresh test.db.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: { DATABASE_URL: 'file:./test.db' },
    // One SQLite file, so run test files one after another.
    fileParallelism: false,
  },
});
