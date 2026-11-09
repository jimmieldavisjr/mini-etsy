import { Entity } from '../../../shared/domain/entity.js';
import { Slug } from '../../../shared/domain/slug.js';

/** A browsing group such as "Jewelry". Plain data, so it stays thin. */
export class Category extends Entity {
  private constructor(
    id: string,
    readonly name: string,
    readonly slug: Slug,
  ) {
    super(id);
  }

  static restore(props: { id: string; name: string; slug: string }): Category {
    return new Category(props.id, props.name, Slug.of(props.slug));
  }
}

/** A category with the number of active products in it, for listings. */
export interface CategoryWithCount {
  category: Category;
  productCount: number;
}
