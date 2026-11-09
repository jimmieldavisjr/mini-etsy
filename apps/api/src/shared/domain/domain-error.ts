/**
 * Base class for errors raised by domain rules. The presentation layer maps
 * each kind to an HTTP status, so domain code never knows about HTTP.
 */
export type DomainErrorKind = 'validation' | 'not_found' | 'conflict';

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Input breaks a rule, such as a negative price or a quantity over 99. */
export class ValidationError extends DomainError {
  readonly kind = 'validation' as const;
}

/** The thing asked for does not exist. */
export class NotFoundError extends DomainError {
  readonly kind = 'not_found' as const;
}

/** The request is valid but clashes with current state, such as short stock. */
export class ConflictError extends DomainError {
  readonly kind = 'conflict' as const;
}
