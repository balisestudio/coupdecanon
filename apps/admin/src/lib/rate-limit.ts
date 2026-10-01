import type { MedusaResponse } from "@medusajs/framework/http";
import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

/**
 * Limits on what anyone can ask of the store's public routes, counted in the cache (Redis)
 * so every Medusa process shares them. The storefront calls these routes for every visitor,
 * from one address: the limits go by what's asked for, such as an e-mail address, rather
 * than by who asks.
 */

type Window = { count: number; resetAt: number };

/** Counts one more `key` and says whether it went past `limit` in the current window. */
export async function overLimit(
  container: MedusaContainer,
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const cache = container.resolve(Modules.CACHE);
  const cacheKey = `rate-limit:${key}`;
  const now = Date.now();
  const stored = await cache.get<Window>(cacheKey);
  const current =
    stored && stored.resetAt > now ? stored : { count: 0, resetAt: now + windowSeconds * 1000 };
  const next = { count: current.count + 1, resetAt: current.resetAt };
  await cache.set(cacheKey, next, Math.max(1, Math.ceil((next.resetAt - now) / 1000)));
  return next.count > limit;
}

/** Whether any of the limits is passed; every one counts the request. */
export async function overAnyLimit(
  container: MedusaContainer,
  limits: { key: string; limit: number; windowSeconds: number }[],
) {
  const results = await Promise.all(
    limits.map(({ key, limit, windowSeconds }) => overLimit(container, key, limit, windowSeconds)),
  );
  return results.some(Boolean);
}

export function tooManyRequests(res: MedusaResponse) {
  res.status(429).json({
    type: "too_many_requests",
    message: "Too many requests: wait a few minutes, then try again.",
  });
}

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
