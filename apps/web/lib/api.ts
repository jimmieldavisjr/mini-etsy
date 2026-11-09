/**
 * Typed client for the Mini-Etsy API. The web app talks to the API only
 * through this file.
 *
 * On the server it calls API_URL directly. In the browser it calls /api,
 * which next.config.ts rewrites to the API, so the cart cookie is first-party.
 */
import type {
  AddCartItemRequest,
  ApiErrorDto,
  CartDto,
  CategoryDto,
  CheckoutRequest,
  OrderDto,
  ProductDetailDto,
  ProductListQuery,
  ProductSummaryDto,
  UpdateCartItemRequest,
} from '@mini-etsy/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function baseUrl(): string {
  return typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000')
    : '/api';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText || 'Request failed';
    try {
      const body = (await res.json()) as Partial<ApiErrorDto>;
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      // Not JSON; keep the status text.
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

function toQueryString(query: ProductListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

const enc = encodeURIComponent;

export const api = {
  // Catalog
  listCategories: () => request<CategoryDto[]>('/categories'),
  getCategory: (slug: string) => request<CategoryDto>(`/categories/${enc(slug)}`),
  listProducts: (query: ProductListQuery = {}) =>
    request<ProductSummaryDto[]>(`/products${toQueryString(query)}`),
  getProduct: (slug: string) => request<ProductDetailDto>(`/products/${enc(slug)}`),

  // Cart (browser only: the cart lives in a cookie)
  getCart: () => request<CartDto>('/cart'),
  addToCart: (body: AddCartItemRequest) =>
    request<CartDto>('/cart/items', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (productId: string, body: UpdateCartItemRequest) =>
    request<CartDto>(`/cart/items/${enc(productId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  removeCartItem: (productId: string) =>
    request<CartDto>(`/cart/items/${enc(productId)}`, { method: 'DELETE' }),

  // Ordering
  checkout: (body: CheckoutRequest) =>
    request<OrderDto>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (id: string) => request<OrderDto>(`/orders/${enc(id)}`),
};

/** Event the cart widgets fire so the header count can refresh. */
export const CART_CHANGED_EVENT = 'mini-etsy:cart-changed';

export function announceCartChange(cart: CartDto): void {
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT, { detail: cart }));
}
