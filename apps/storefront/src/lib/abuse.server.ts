import { env } from "@coupdecanon/config/storefront-env";
import { getRequestIP } from "@tanstack/react-start/server";
import type { BotTrapValues } from "./bot-trap";

/**
 * The public forms' first line of defence against scripts: a trap only scripts fill in, and a
 * cap on attempts per address. The cap lives in this server's memory, enough to slow a script
 * down; Medusa holds the firm limits, per e-mail address, for anyone calling it directly.
 */

const attempts = new Map<string, number[]>();

/** In production the shop runs behind a proxy, which gives the visitor's address. */
const visitorAddress = () =>
  getRequestIP({ xForwardedFor: env.NODE_ENV === "production" }) ?? "inconnue";

/** Whether this visitor made more than `limit` attempts at `action` within `windowMs`. */
export function tooManyAttempts(action: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${action}:${visitorAddress()}`;
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 10_000) {
    for (const [other, times] of attempts) {
      if (times.every((time) => now - time >= windowMs)) attempts.delete(other);
    }
  }
  return recent.length > limit;
}

export const TOO_MANY_ATTEMPTS =
  "Trop de tentatives d’affilée. Patientez quelques minutes, puis réessayez.";

/** Scripts fill every field, the trap included, and send the form the moment it shows. */
const FASTEST_HUMAN_MS = 2000;

export const isBot = (trap: BotTrapValues | undefined) =>
  Boolean(trap?.website) ||
  (typeof trap?.shownAt === "number" && Date.now() - trap.shownAt < FASTEST_HUMAN_MS);
