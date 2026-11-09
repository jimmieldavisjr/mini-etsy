import { ValidationError } from '../../../shared/domain/domain-error.js';
import { Entity } from '../../../shared/domain/entity.js';
import { Money } from '../../../shared/domain/money.js';
import { Slug } from '../../../shared/domain/slug.js';

export interface ProductProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  shopName: string;
  active: boolean;
  createdAt: Date;
  imageUrl: string | null;
  imageSourceUrl: string | null;
  category: { id: string; slug: string; name: string };
}

/** A handmade item listed by a shop. */
export class Product extends Entity {
  private constructor(
    id: string,
    readonly title: string,
    readonly slug: Slug,
    readonly description: string,
    readonly price: Money,
    readonly stock: number,
    readonly shopName: string,
    readonly active: boolean,
    readonly createdAt: Date,
    readonly imageUrl: string | null,
    readonly imageSourceUrl: string | null,
    readonly category: { id: string; slug: string; name: string },
  ) {
    super(id);
  }

  static restore(props: ProductProps): Product {
    if (!Number.isInteger(props.stock) || props.stock < 0) {
      throw new ValidationError(
        `Stock must be a whole, non-negative number (got ${props.stock})`,
      );
    }
    return new Product(
      props.id,
      props.title,
      Slug.of(props.slug),
      props.description,
      Money.fromCents(props.priceCents),
      props.stock,
      props.shopName,
      props.active,
      props.createdAt,
      props.imageUrl,
      props.imageSourceUrl,
      props.category,
    );
  }

  /** Listed and with at least one left. */
  get isPurchasable(): boolean {
    return this.active && this.stock > 0;
  }
}
