import type { CartDto, CartLineDto } from '@mini-etsy/shared';
import type { Cart } from '../domain/cart.js';
import type { ProductLookup } from './product-lookup.port.js';

export function emptyCartDto(): CartDto {
  return { id: null, lines: [], itemCount: 0, subtotalCents: 0 };
}

/**
 * Builds the cart response with current titles and prices from the catalog.
 * Lines for products that left the catalog stay visible but are marked
 * unavailable and left out of the subtotal.
 */
export async function buildCartDto(
  cart: Cart,
  products: ProductLookup,
): Promise<CartDto> {
  const items = cart.items;
  const found = await products.findProducts(items.map((i) => i.productId));
  const byId = new Map(found.map((p) => [p.id, p]));

  const lines: CartLineDto[] = items.map(({ productId, quantity }) => {
    const product = byId.get(productId);
    const available = !!product && product.active;
    const unitPriceCents = product?.priceCents ?? 0;
    return {
      productId,
      slug: product?.slug ?? '',
      title: product?.title ?? 'Item no longer available',
      shopName: product?.shopName ?? '',
      unitPriceCents,
      quantity: quantity.value,
      lineTotalCents: available ? unitPriceCents * quantity.value : 0,
      stock: available ? product.stock : 0,
      available,
    };
  });

  return {
    id: cart.id,
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
  };
}
