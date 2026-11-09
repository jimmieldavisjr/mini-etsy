import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorDto } from '@mini-etsy/shared';
import { DomainError, type DomainErrorKind } from '../domain/domain-error.js';

const STATUS_BY_KIND: Record<DomainErrorKind, HttpStatus> = {
  validation: HttpStatus.BAD_REQUEST,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
};

const ERROR_NAME_BY_KIND: Record<DomainErrorKind, string> = {
  validation: 'Bad Request',
  not_found: 'Not Found',
  conflict: 'Conflict',
};

/** Turns domain errors into HTTP responses shaped like Nest's own errors. */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = STATUS_BY_KIND[error.kind];
    const body: ApiErrorDto = {
      statusCode,
      error: ERROR_NAME_BY_KIND[error.kind],
      message: error.message,
    };
    response.status(statusCode).json(body);
  }
}
