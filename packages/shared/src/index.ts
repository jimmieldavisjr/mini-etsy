/**
 * DTO types shared by the API (NestJS) and the web app (Next.js).
 *
 * This package holds types only, so it has no runtime code and no build step.
 * Both apps import it with `import type`. All money values are integer cents.
 */

// ---------- Catalog ----------

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  /** Base URL of the category photo, or null. */
  imageUrl: string | null;
}

export interface ProductSummaryDto {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  stock: number;
  shopName: string;
  categorySlug: string;
  /** Base URL of the product photo, or null. */
  imageUrl: string | null;
}

export interface ProductDetailDto extends ProductSummaryDto {
  description: string;
  categoryName: string;
  /** Page on Unsplash that credits the photographer, or null. */
  imageSourceUrl: string | null;
}

export type ProductSort = 'new' | 'price_asc' | 'price_desc';

export interface ProductListQuery {
  category?: string;
  q?: string;
  sort?: ProductSort;
  limit?: number;
}

// ---------- Cart ----------

export interface CartLineDto {
  productId: string;
  slug: string;
  title: string;
  shopName: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  stock: number;
  /** False when the product was removed from the catalog after it was added. */
  available: boolean;
}

export interface CartDto {
  /** Null until the first item is added. */
  id: string | null;
  lines: CartLineDto[];
  itemCount: number;
  subtotalCents: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ---------- Ordering ----------

export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface CheckoutRequest {
  email: string;
  shippingName: string;
  shippingAddress: string;
}

export interface OrderLineDto {
  productId: string;
  title: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  totalCents: number;
  email: string;
  shippingName: string;
  shippingAddress: string;
  createdAt: string;
  lines: OrderLineDto[];
}

export interface ChangeOrderStatusRequest {
  status: OrderStatus;
}

// ---------- Errors ----------

export interface ApiErrorDto {
  statusCode: number;
  error: string;
  message: string | string[];
}
