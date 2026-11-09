import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient, type Prisma } from '../../generated/prisma/client.js';
import type { TransactionRunner } from '../application/transaction-runner.js';

export type Db = Prisma.TransactionClient;

/**
 * Owns the single Prisma client. Repositories read `db`, which is the active
 * transaction when called inside `run`, and the plain client otherwise.
 */
@Injectable()
export class PrismaService implements TransactionRunner, OnModuleDestroy {
  private readonly client: PrismaClient;
  private readonly currentTx = new AsyncLocalStorage<Db>();

  constructor() {
    // Relative SQLite paths resolve from the working directory (apps/api).
    const url = process.env.DATABASE_URL ?? 'file:./dev.db';
    this.client = new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url }),
    });
  }

  get db(): Db {
    return this.currentTx.getStore() ?? this.client;
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    if (this.currentTx.getStore()) return work();
    return this.client.$transaction((tx) => this.currentTx.run(tx, work));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
