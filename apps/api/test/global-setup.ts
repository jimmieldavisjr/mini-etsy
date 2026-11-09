/**
 * Runs once before the e2e tests: deletes the test database, applies the
 * migrations to a fresh file and seeds it. The dev database is never touched.
 */
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createSeedClient, seed } from '../prisma/seed.js';

export const TEST_DATABASE_URL = 'file:./test.db';

export default async function setup(): Promise<void> {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(`./test.db${suffix}`, { force: true });
  }

  // Run the Prisma CLI with this Node binary, so no shell is needed on any OS.
  const prismaCli = createRequire(import.meta.url).resolve('prisma/build/index.js');
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'pipe',
  });

  const prisma = createSeedClient(TEST_DATABASE_URL);
  try {
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
