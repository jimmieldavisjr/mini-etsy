/**
 * Runs work in one database transaction. Repositories called inside `run`
 * join the same transaction, so a use case can span several modules' tables
 * without any module importing another's infrastructure.
 */
export interface TransactionRunner {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const TRANSACTION_RUNNER = Symbol('TransactionRunner');
