import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './shared/infrastructure/configure-app.js';

// Optional overrides; every setting has a localhost default.
if (existsSync('.env')) process.loadEnvFile('.env');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  // API_PORT rather than PORT, which Next.js and hosting tools use for the web app.
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  console.log(`Mini-Etsy API listening on http://localhost:${port}`);
}
await bootstrap();
