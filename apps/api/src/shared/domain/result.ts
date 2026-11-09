import type { DomainError } from './domain-error.js';

/** The outcome of an operation that can fail without throwing. */
export type Result<T, E = DomainError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },
  fail<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },
  /** Returns the value, or throws the error. */
  unwrap<T, E>(result: Result<T, E>): T {
    if (result.ok) return result.value;
    throw result.error;
  },
};
