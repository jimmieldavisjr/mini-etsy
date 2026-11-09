import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma does not load .env on its own. Node can, so use that when a .env exists.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Relative SQLite paths resolve from apps/api, where every script runs.
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});
