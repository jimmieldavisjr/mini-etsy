import { ValidationError } from './domain-error.js';
import { Result } from './result.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 80;

/** A URL-safe name such as "home-and-living": lowercase words joined by hyphens. */
export class Slug {
  private constructor(readonly value: string) {}

  static of(value: string): Slug {
    return Result.unwrap(Slug.tryOf(value));
  }

  static tryOf(value: string): Result<Slug, ValidationError> {
    if (
      value.length === 0 ||
      value.length > MAX_LENGTH ||
      !SLUG_PATTERN.test(value)
    ) {
      return Result.fail(
        new ValidationError(
          `"${value}" is not a valid slug (lowercase letters, numbers and single hyphens, up to ${MAX_LENGTH} characters)`,
        ),
      );
    }
    return Result.ok(new Slug(value));
  }

  /** Builds a slug from free text, for example "Home & Living" becomes "home-and-living". */
  static fromText(text: string): Slug {
    const value = text
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_LENGTH)
      .replace(/-+$/, '');
    return Slug.of(value);
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
