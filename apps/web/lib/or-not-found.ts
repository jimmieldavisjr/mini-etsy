import { notFound } from 'next/navigation';
import { ApiError } from './api';

/**
 * Awaits an API call and shows the not-found page when the API answers 404
 * (or 400, which it returns for ids that are not even well formed).
 */
export async function orNotFound<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }
}
