/**
 * How many items the visitor's cart holds, in a cookie the page's scripts can read: the
 * header shows it as soon as the page runs, without waiting for Medusa. Only the count: the
 * cart itself stays in a cookie they can't read.
 */
export const CART_COUNT_COOKIE = "cdc_cart_count";

/** The count the cookie holds, or `null` without one. */
export function readCartCount() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CART_COUNT_COOKIE}=(\\d+)`));
  return match ? Number(match[1]) : null;
}
