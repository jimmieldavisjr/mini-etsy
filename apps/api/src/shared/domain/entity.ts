/** An object with an identity that stays the same as its other fields change. */
export abstract class Entity<TId = string> {
  protected constructor(readonly id: TId) {}

  equals(other?: Entity<TId>): boolean {
    if (!other) return false;
    return other.constructor === this.constructor && other.id === this.id;
  }
}
