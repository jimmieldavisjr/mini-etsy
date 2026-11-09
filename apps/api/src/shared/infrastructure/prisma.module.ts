import { Global, Module } from '@nestjs/common';
import { TRANSACTION_RUNNER } from '../application/transaction-runner.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: TRANSACTION_RUNNER, useExisting: PrismaService },
  ],
  exports: [PrismaService, TRANSACTION_RUNNER],
})
export class PrismaModule {}
