import { isStrongPassword, PASSWORD_HINT } from "@coupdecanon/config/forms";
import {
  type AuthenticatedMedusaRequest,
  authenticate,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";
import { HOUR, overLimit, tooManyRequests } from "../lib/rate-limit";

/**
 * Limits on the customers' sign-in, sign-up and password reset, by e-mail address: guessing a
 * password, or flooding an inbox with reset links, takes more tries than these allow.
 */
const limitByEmail =
  (action: string, limit: number, windowSeconds: number) =>
  async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const body = (req.body ?? {}) as { email?: unknown; identifier?: unknown };
    const email = [body.email, body.identifier].find((value) => typeof value === "string");
    if (
      typeof email === "string" &&
      (await overLimit(req.scope, `${action}:${email.toLowerCase()}`, limit, windowSeconds))
    ) {
      return tooManyRequests(res);
    }
    next();
  };

/**
 * A customer's new password meets the shop's rules, whichever way it arrives: the storefront
 * checks them first, and so does Medusa, for anyone calling it directly.
 */
const requireStrongPassword = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  const { password } = (req.body ?? {}) as { password?: unknown };
  if (typeof password !== "string" || !isStrongPassword(password)) {
    res.status(400).json({ type: "invalid_data", message: PASSWORD_HINT });
    return;
  }
  next();
};

/** Guessing a signed-in customer's current password takes more tries than these allow. */
const limitByCustomer =
  (action: string, limit: number, windowSeconds: number) =>
  async (req: AuthenticatedMedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const key = `${action}:${req.auth_context.actor_id}`;
    if (await overLimit(req.scope, key, limit, windowSeconds)) return tooManyRequests(res);
    next();
  };

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/customer/emailpass",
      method: ["POST"],
      middlewares: [limitByEmail("connexion", 10, HOUR / 4)],
    },
    {
      matcher: "/auth/customer/emailpass/register",
      method: ["POST"],
      middlewares: [limitByEmail("inscription", 5, HOUR), requireStrongPassword],
    },
    {
      matcher: "/auth/customer/emailpass/update",
      method: ["POST"],
      middlewares: [requireStrongPassword],
    },
    {
      matcher: "/store/customers/me/password",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        limitByCustomer("changement-mot-de-passe", 5, HOUR),
      ],
    },
    {
      matcher: "/auth/customer/emailpass/reset-password",
      method: ["POST"],
      middlewares: [limitByEmail("mot-de-passe", 3, HOUR)],
    },
  ],
});
