import type { CookieOptions, Request } from 'express';

/** Name of the cookie that holds a guest's cart id. */
export const CART_COOKIE = 'cart_id';

/** Reads the cart id from the request's cookie, if there is one. */
export function cartIdFrom(req: Request): string | undefined {
  const value: unknown = req.cookies?.[CART_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export const CART_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};
