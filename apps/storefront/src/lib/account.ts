import {
  LOGIN_FAILED,
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateProfile,
  validateRegister,
  validateResetPassword,
} from "@coupdecanon/config/forms";
import { CONSENT_KEY, type Consent } from "@coupdecanon/config/legal";
import { env } from "@coupdecanon/config/storefront-env";
import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import * as z from "zod/mini";
import { isBot, TOO_MANY_ATTEMPTS, tooManyAttempts } from "./abuse.server";
import type { BotTrapValues } from "./bot-trap";
import { CART_COUNT_COOKIE } from "./cart-count";
import { type Catalog, getCatalog, pathOf } from "./catalog.server";
import { legalVersions } from "./legal.server";
import { medusa } from "./medusa.server";
import { orderDiscountLabel } from "./order-discount.server";
import { PATHS } from "./paths";

/**
 * A signed-in customer's Medusa token lives in a cookie the page's scripts can't read; each
 * request to Medusa passes it itself. Account pages are the customer's own: no shared cache
 * keeps them.
 */
const SESSION_COOKIE = "cdc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const CART_COOKIE = "cdc_cart";

export const authHeaders = (token: string) => ({ authorization: `Bearer ${token}` });

const keepPrivate = () => setResponseHeader("Cache-Control", "private, no-store");

function startSession(token: string) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

const endSession = () => setCookie(SESSION_COOKIE, "", { path: "/", maxAge: 0 });

/** Validates a form's data on the server too, since anyone can post to it. */
const validated =
  <T>(validate: (data: unknown) => { ok: true; data: T } | { ok: false; error: string }) =>
  (data: unknown) => {
    const result = validate(data);
    if (!result.ok) throw new Error(result.error);
    return result.data;
  };

/** The same, for a form that also carries a bot trap (see `bot-trap.ts`). */
const validatedWithTrap =
  <T>(validate: (data: unknown) => { ok: true; data: T } | { ok: false; error: string }) =>
  (data: unknown) => {
    const { trap, ...fields } = (data ?? {}) as { trap?: BotTrapValues };
    return { ...validated(validate)(fields), trap };
  };

const MINUTE = 60_000;
const tooMany = { ok: false, error: TOO_MANY_ATTEMPTS } as const;

/** The HTTP status of a Medusa error, if it has one. */
const statusOf_ = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  typeof error.status === "number"
    ? error.status
    : null;

/** Medusa's messages are in English: the customer reads these instead. */
const failure = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : "";
  if (statusOf_(error) === 429) return TOO_MANY_ATTEMPTS;
  if (/already exists/i.test(message)) {
    return "Un compte existe déjà avec cette adresse e-mail. Connectez-vous.";
  }
  return fallback;
};

/**
 * A refused sign-in says the same whether the address or the password was wrong: it tells no
 * one which addresses have an account. Only an outage reads differently.
 */
const loginFailure = (error: unknown) => {
  const status = statusOf_(error);
  if (status === 429) return TOO_MANY_ATTEMPTS;
  if (status !== null && status >= 500) return "La connexion n’a pas abouti. Réessayez.";
  if (status === null && !(error instanceof Error && /password|unauthori/i.test(error.message))) {
    return "La connexion n’a pas abouti. Réessayez.";
  }
  return LOGIN_FAILED;
};

/** The cart the visitor filled before signing in becomes theirs. */
async function claimCart(token: string) {
  const cartId = getCookie(CART_COOKIE);
  if (!cartId) return;
  await medusa.store.cart.transferCart(cartId, {}, authHeaders(token)).catch(() => undefined);
}

async function logIn(email: string, password: string) {
  const token = await medusa.auth.login("customer", "emailpass", { email, password });
  if (typeof token !== "string") throw new Error("Unexpected login step");
  startSession(token);
  await claimCart(token);
  return token;
}

/** The signed-in customer, or null. */
export async function currentCustomer() {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  try {
    const { customer } = await medusa.store.customer.retrieve(
      { fields: "id,email,first_name,last_name,phone,metadata" },
      authHeaders(token),
    );
    return { token, customer };
  } catch {
    // An expired or revoked token signs the visitor out.
    endSession();
    return null;
  }
}

/** For the account pages: the customer, or off to sign in, then back. */
async function requireCustomer(from: string) {
  keepPrivate();
  const session = await currentCustomer();
  if (!session) throw redirect({ href: `${PATHS.login}?next=${encodeURIComponent(from)}` });
  return session;
}

export const customerView = (
  customer: NonNullable<Awaited<ReturnType<typeof currentCustomer>>>["customer"],
) => ({
  email: customer.email,
  firstName: customer.first_name ?? "",
  lastName: customer.last_name ?? "",
  phone: customer.phone ?? "",
  newsletter: customer.metadata?.newsletter === true,
});

/** Whether a visitor is signed in, and as whom, for the checkout's prefill. */
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await currentCustomer();
  return session ? customerView(session.customer) : null;
});

export const logInCustomer = createServerFn({ method: "POST" })
  .validator(validated(validateLogin))
  .handler(async ({ data }) => {
    // Guessing passwords one after the other takes more than a few tries a minute.
    if (tooManyAttempts("connexion", 10, 15 * MINUTE)) return tooMany;
    try {
      await logIn(data.email, data.password);
      return { ok: true } as const;
    } catch (error) {
      return { ok: false, error: loginFailure(error) } as const;
    }
  });

/**
 * What an account's creation records it accepted: the terms of use and the privacy policy, in
 * their versions in force, the dates they took effect in Payload.
 */
async function accountConsent(): Promise<Consent> {
  const versions = await legalVersions();
  return {
    accepted_at: new Date().toISOString(),
    terms_of_use: versions["terms-of-use"],
    privacy_policy: versions.privacy,
  };
}

export const registerCustomer = createServerFn({ method: "POST" })
  .validator(validatedWithTrap(validateRegister))
  .handler(async ({ data: { trap, ...data } }) => {
    if (isBot(trap))
      return { ok: false, error: "Le compte n’a pas pu être créé. Réessayez." } as const;
    if (tooManyAttempts("inscription", 5, 60 * MINUTE)) return tooMany;
    try {
      const registration = await medusa.auth.register("customer", "emailpass", {
        email: data.email,
        password: data.password,
      });
      await medusa.store.customer.create(
        { email: data.email, first_name: data.firstName, last_name: data.lastName },
        {},
        authHeaders(registration),
      );
      const token = await logIn(data.email, data.password);
      // Medusa leaves out the metadata of a customer it creates: the terms the customer
      // accepted, and their choice for the letter, are saved after.
      await medusa.store.customer.update(
        {
          metadata: {
            [CONSENT_KEY]: await accountConsent(),
            ...(data.newsletter
              ? { newsletter: true, newsletter_since: new Date().toISOString() }
              : {}),
          },
        },
        {},
        authHeaders(token),
      );
      return { ok: true } as const;
    } catch (error) {
      return {
        ok: false,
        error: failure(error, "Le compte n’a pas pu être créé. Réessayez."),
      } as const;
    }
  });

/**
 * Signs the customer out. Their cart is theirs: the browser lets go of it too, so the next
 * person on the same computer starts with an empty one.
 */
export const logOutCustomer = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
  setCookie(CART_COOKIE, "", { path: "/", maxAge: 0 });
  setCookie(CART_COUNT_COOKIE, "", { path: "/", maxAge: 0 });
  return { ok: true } as const;
});

/** Sends the reset link; says nothing about whether the address has an account. */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(validatedWithTrap(validateForgotPassword))
  .handler(async ({ data: { trap, ...data } }) => {
    // A script is told the link left, and nothing does.
    if (isBot(trap)) return { ok: true } as const;
    if (tooManyAttempts("mot-de-passe", 5, 60 * MINUTE)) return tooMany;
    await medusa.auth
      .resetPassword("customer", "emailpass", { identifier: data.email })
      .catch(() => undefined);
    return { ok: true } as const;
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator(validated(validateResetPassword))
  .handler(async ({ data }) => {
    if (tooManyAttempts("nouveau-mot-de-passe", 10, 60 * MINUTE)) return tooMany;
    try {
      await medusa.auth.updateProvider(
        "customer",
        "emailpass",
        { email: data.email, password: data.password },
        data.token,
      );
      await logIn(data.email, data.password);
      return { ok: true } as const;
    } catch {
      return {
        ok: false,
        error: "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.",
      } as const;
    }
  });

const ORDER_FIELDS = [
  "id",
  "display_id",
  "created_at",
  "status",
  "fulfillment_status",
  "payment_status",
  "currency_code",
  "total",
  "original_total",
  "original_item_total",
  "discount_total",
  "summary.*",
  "items.id",
  "items.quantity",
  "items.unit_price",
  "items.variant_id",
  "items.product_title",
  "items.product_handle",
  "items.variant_title",
  "items.thumbnail",
].join(",");

type MedusaOrder = Awaited<ReturnType<typeof medusa.store.order.list>>["orders"][number];

/** Where an order stands, in the customer's words. */
function statusOf(order: MedusaOrder) {
  if (order.status === "canceled") return "canceled" as const;
  if (order.fulfillment_status === "delivered") return "collected" as const;
  if (order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped") {
    return "ready" as const;
  }
  return "preparing" as const;
}

/** What the shop refunded of an order, all refunds together. */
const refundedOf = (order: MedusaOrder) => {
  const summary = (order as { summary?: { refunded_total?: number } }).summary;
  return Math.max(0, summary?.refunded_total ?? 0);
};

const orderView = (order: MedusaOrder, catalog: Catalog | null = null) => ({
  id: order.id,
  displayId: order.display_id,
  createdAt: String(order.created_at),
  status: statusOf(order),
  currencyCode: order.currency_code,
  // A canceled order's total drops to nothing in Medusa: it shows what it came to.
  total: (order.status === "canceled" ? order.original_total : order.total) ?? 0,
  refunded: refundedOf(order),
  subtotal: order.original_item_total ?? 0,
  discount: order.discount_total ?? 0,
  lines: (order.items ?? []).map((item) => ({
    id: item.id,
    variantId: item.variant_id ?? null,
    title: item.product_title ?? "",
    handle: item.product_handle ?? null,
    href: pathOf(catalog, item.product_handle),
    format: item.variant_title ?? null,
    thumbnail: item.thumbnail ?? null,
    quantity: item.quantity,
    total: (item.unit_price ?? 0) * item.quantity,
  })),
});

export type AccountOrder = ReturnType<typeof orderView>;

/** Orders per page of the account's history. */
const ORDERS_PER_PAGE = 20;

/** The account's home: the customer and their orders, the latest first, a page at a time. */
export const getAccountOrders = createServerFn({ method: "GET" })
  .validator(z.object({ page: z.int().check(z.positive()) }))
  .handler(async ({ data }) => {
    const { token, customer } = await requireCustomer(PATHS.account);
    const { orders, count } = await medusa.store.order.list(
      {
        fields: ORDER_FIELDS,
        order: "-created_at",
        limit: ORDERS_PER_PAGE,
        offset: (data.page - 1) * ORDERS_PER_PAGE,
      },
      authHeaders(token),
    );
    return {
      customer: customerView(customer),
      orders: orders.map((order) => orderView(order)),
      count,
      page: data.page,
      pages: Math.max(1, Math.ceil(count / ORDERS_PER_PAGE)),
    };
  });

export const getAccountOrder = createServerFn({ method: "GET" })
  .validator(z.object({ orderId: z.string().check(z.minLength(1)) }))
  .handler(async ({ data }) => {
    const { token, customer } = await requireCustomer(PATHS.accountOrder(data.orderId));
    const [{ order }, discount, catalog] = await Promise.all([
      medusa.store.order
        .retrieve(data.orderId, { fields: ORDER_FIELDS }, authHeaders(token))
        .catch(() => {
          throw notFound();
        }),
      orderDiscountLabel(data.orderId),
      getCatalog(),
    ]);
    return {
      customer: customerView(customer),
      order: { ...orderView(order, catalog), discountLabel: discount },
    };
  });

/** Puts an order's products back in the cart, as many as then. */
export const reorder = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.string().check(z.minLength(1)) }))
  .handler(async ({ data }) => {
    const { token } = await requireCustomer(PATHS.account);
    const { order } = await medusa.store.order.retrieve(
      data.orderId,
      { fields: "items.variant_id,items.quantity" },
      authHeaders(token),
    );
    return (order.items ?? []).flatMap((item) =>
      item.variant_id ? [{ variantId: item.variant_id, quantity: item.quantity }] : [],
    );
  });

/** The account's details page: the customer as Medusa has them. */
export const getAccountDetails = createServerFn({ method: "GET" }).handler(async () => {
  const { customer } = await requireCustomer(PATHS.accountDetails);
  return { customer: customerView(customer) };
});

export const updateProfile = createServerFn({ method: "POST" })
  .validator(validated(validateProfile))
  .handler(async ({ data }) => {
    const { token } = await requireCustomer(PATHS.account);
    await medusa.store.customer.update(
      { first_name: data.firstName, last_name: data.lastName, phone: data.phone ?? null },
      {},
      authHeaders(token),
    );
    return { ok: true } as const;
  });

export const setNewsletter = createServerFn({ method: "POST" })
  .validator(z.object({ subscribed: z.boolean() }))
  .handler(async ({ data }) => {
    const { token, customer } = await requireCustomer(PATHS.account);
    await medusa.store.customer.update(
      {
        metadata: {
          ...customer.metadata,
          newsletter: data.subscribed,
          ...(data.subscribed ? { newsletter_since: new Date().toISOString() } : {}),
        },
      },
      {},
      authHeaders(token),
    );
    return { ok: true } as const;
  });

/**
 * Changes a signed-in customer's password, given their current one. A wrong current password
 * is the field's error; the customer stays signed in.
 */
export const changePassword = createServerFn({ method: "POST" })
  .validator(validated(validateChangePassword))
  .handler(async ({ data }) => {
    const { token } = await requireCustomer(PATHS.accountDetails);
    try {
      await medusa.client.fetch("/store/customers/me/password", {
        method: "POST",
        headers: authHeaders(token),
        body: { current_password: data.currentPassword, new_password: data.newPassword },
      });
      return { ok: true } as const;
    } catch (error) {
      if (
        statusOf_(error) === 400 &&
        error instanceof Error &&
        /current password/i.test(error.message)
      ) {
        return {
          ok: false,
          field: "currentPassword",
          error: "Ce n’est pas votre mot de passe actuel.",
        } as const;
      }
      return {
        ok: false,
        field: null,
        error: failure(error, "Le mot de passe n’a pas pu être changé. Réessayez."),
      } as const;
    }
  });

/** The sign-in page: already signed in, straight to the account. */
export const getLoginPage = createServerFn({ method: "GET" }).handler(async () => {
  keepPrivate();
  if (await currentCustomer()) throw redirect({ to: "/account" });
  return null;
});
