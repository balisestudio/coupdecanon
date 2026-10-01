import { validateCheckout } from "@coupdecanon/config/forms";
import { CONSENT_KEY, type Consent } from "@coupdecanon/config/legal";
import { env } from "@coupdecanon/config/storefront-env";
import {
  appliedTiers,
  discountLabel,
  type VolumeStanding,
} from "@coupdecanon/config/volume-discounts";
import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import * as z from "zod/mini";
import { authHeaders, currentCustomer, customerView } from "./account";
import { CARD_PAYMENT_METHODS } from "./card-payment";
import { CART_COUNT_COOKIE } from "./cart-count";
import {
  type Catalog,
  getCatalog,
  type ProductSummary,
  pathOf,
  retrieveRegion,
} from "./catalog.server";
import { readGlobal } from "./cms.server";
import { legalVersions } from "./legal.server";
import { medusa } from "./medusa.server";
import { orderDiscountLabel } from "./order-discount.server";
import { getShopInfo } from "./shop.server";

/**
 * The visitor's cart lives in Medusa; the browser only keeps its id, in a cookie the page's
 * scripts can't read, and how many items it holds, in one they can: the header shows the
 * count without asking Medusa. The shop's pages stay the same for everyone, so shared caches
 * can serve them: the cart loads after them. The cart and checkout pages are the visitor's own.
 */
const CART_COOKIE = "cdc_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
/** The orders this browser placed lately, whose confirmation pages it may open. */
const ORDERS_COOKIE = "cdc_orders";
const ORDERS_KEPT = 5;
const ORDERS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const LINE_FIELDS = "items.id,items.variant_id,items.quantity";
const DETAIL_FIELDS = [
  "id",
  "email",
  "currency_code",
  "completed_at",
  "metadata",
  "original_item_total",
  "discount_total",
  "total",
  "items.id",
  "items.variant_id",
  "items.quantity",
  "items.unit_price",
  "items.product_title",
  "items.product_handle",
  "items.variant_title",
  "items.thumbnail",
].join(",");

/** A cart line: one format of a product, in some quantity. */
export type CartLine = { id: string; variantId: string; quantity: number };

export type CartDetails = {
  id: string;
  email: string | null;
  currencyCode: string;
  lines: (CartLine & {
    title: string;
    format: string | null;
    handle: string | null;
    /** The product's page, while the shop has it. */
    href: string | null;
    thumbnail: string | null;
    unitPrice: number;
  })[];
  /** Before the discount, tax included. */
  subtotal: number;
  discount: number;
  total: number;
  /** The discount's name, from the volume discount tiers the cart got. */
  discountLabel: string;
  /** Where the cart stands on each volume discount, as Medusa counts it. */
  volume: VolumeStanding[];
};

type MedusaCart = {
  id: string;
  email?: string | null;
  currency_code?: string;
  completed_at?: string | Date | null;
  metadata?: Record<string, unknown> | null;
  original_item_total?: number;
  discount_total?: number;
  total?: number;
  items?:
    | {
        id: string;
        variant_id?: string | null;
        quantity: number;
        unit_price?: number;
        product_title?: string | null;
        product_handle?: string | null;
        variant_title?: string | null;
        thumbnail?: string | null;
      }[]
    | null;
};

const cookieOptions = (maxAge: number, httpOnly = true) => ({
  httpOnly,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/** The cart's lines, noting their count for the header on the way. */
function linesOf(cart: MedusaCart | null): CartLine[] {
  const lines = (cart?.items ?? []).flatMap((item) =>
    item.variant_id ? [{ id: item.id, variantId: item.variant_id, quantity: item.quantity }] : [],
  );
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  setCookie(CART_COUNT_COOKIE, String(count), cookieOptions(CART_COOKIE_MAX_AGE, false));
  return lines;
}

function forgetCart() {
  setCookie(CART_COOKIE, "", { path: "/", maxAge: 0 });
  setCookie(CART_COUNT_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Whether Medusa answered that it doesn't know what was asked, rather than failing. */
const isNotFound = (error: unknown) =>
  typeof error === "object" && error !== null && "status" in error && error.status === 404;

/**
 * The cart, or `null` once it's gone: an order now, or unknown to Medusa. When Medusa can't
 * be reached, the cart isn't gone: the error goes on, and the browser keeps its cart.
 */
async function retrieveCart(id: string, fields = LINE_FIELDS): Promise<MedusaCart | null> {
  try {
    const { cart } = await medusa.store.cart.retrieve(id, { fields: `id,completed_at,${fields}` });
    // A cart that became an order can't take new items.
    return cart.completed_at ? null : (cart as MedusaCart);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

async function currentCart(fields?: string) {
  const id = getCookie(CART_COOKIE);
  if (!id) return null;
  const cart = await retrieveCart(id, fields);
  // An order, or a cart Medusa no longer knows: the next addition opens a new one.
  if (!cart) forgetCart();
  return cart;
}

async function openCart() {
  const region = await retrieveRegion();
  const { cart } = await medusa.store.cart.create({ region_id: region.id }, { fields: "id" });
  setCookie(CART_COOKIE, cart.id, cookieOptions(CART_COOKIE_MAX_AGE));
  return cart.id;
}

/**
 * The volume discounts follow the cart: Medusa gives it the tiers it reaches after every
 * change, and says where it stands on each.
 */
const syncDiscount = (cartId: string) =>
  medusa.client.fetch<{ standings: VolumeStanding[] }>(`/store/carts/${cartId}/volume-discount`, {
    method: "POST",
  });

const standingsOf = (cartId: string) =>
  medusa.client
    .fetch<{ standings: VolumeStanding[] }>(`/store/carts/${cartId}/volume-discount`)
    .then((response) => response.standings)
    .catch(() => []);

/** Cart pages are the visitor's own: no shared cache may keep them. */
const keepPrivate = () => setResponseHeader("Cache-Control", "private, no-store");

/**
 * Medusa's messages are in English and meant for developers: the customer reads these. A
 * change refused for stock says so; anything else asks to try again.
 */
function cartFailure(error: unknown): never {
  const message = error instanceof Error ? error.message : "";
  if (/inventory|stock/i.test(message)) {
    throw new Error("Ce produit n’est plus disponible dans cette quantité.");
  }
  console.error("The cart could not be changed", error);
  throw new Error("Le panier n’a pas pu être mis à jour. Réessayez.");
}

async function detailsOf(cart: MedusaCart, catalog: Catalog | null): Promise<CartDetails> {
  const lines = (cart.items ?? []).flatMap((item) =>
    item.variant_id
      ? [
          {
            id: item.id,
            variantId: item.variant_id,
            quantity: item.quantity,
            title: item.product_title ?? "",
            format: item.variant_title ?? null,
            handle: item.product_handle ?? null,
            href: pathOf(catalog, item.product_handle),
            thumbnail: item.thumbnail ?? null,
            unitPrice: item.unit_price ?? 0,
          },
        ]
      : [],
  );
  return {
    id: cart.id,
    email: cart.email ?? null,
    currencyCode: cart.currency_code ?? "eur",
    lines,
    subtotal: cart.original_item_total ?? 0,
    discount: cart.discount_total ?? 0,
    total: cart.total ?? 0,
    discountLabel: discountLabel(appliedTiers(cart.metadata)),
    volume: await standingsOf(cart.id),
  };
}

/** The visitor's cart lines, for the header's count and the products' buttons. */
export const getCart = createServerFn({ method: "GET" }).handler(async () =>
  linesOf(await currentCart()),
);

const cartChange = z.object({
  variantId: z.string().check(z.minLength(1)),
  quantity: z.int().check(z.gte(0), z.lte(999)),
});

/** Adds some of a product's format to the visitor's cart, opening one if needed. */
export const addToCart = createServerFn({ method: "POST" })
  .validator(cartChange)
  .handler(async ({ data }) => {
    try {
      const cartId = (await currentCart())?.id ?? (await openCart());
      // Medusa adds to the format's line when the cart already holds it.
      await medusa.store.cart.createLineItem(cartId, {
        variant_id: data.variantId,
        quantity: data.quantity,
      });
      await syncDiscount(cartId);
      return linesOf(await retrieveCart(cartId));
    } catch (error) {
      cartFailure(error);
    }
  });

/**
 * Sets how many of a format the cart holds; at 0, its line leaves the cart. The quantity is
 * the one the customer sees, so a change sent twice gives the same cart.
 */
export const setCartQuantity = createServerFn({ method: "POST" })
  .validator(cartChange)
  .handler(async ({ data }) => {
    try {
      const cart = await currentCart();
      const cartId = cart?.id ?? (data.quantity ? await openCart() : null);
      if (!cartId) return linesOf(null);
      const line = cart?.items?.find((item) => item.variant_id === data.variantId);

      if (!line) {
        if (data.quantity) {
          await medusa.store.cart.createLineItem(cartId, {
            variant_id: data.variantId,
            quantity: data.quantity,
          });
        }
      } else if (!data.quantity) {
        await medusa.store.cart.deleteLineItem(cartId, line.id);
      } else if (line.quantity !== data.quantity) {
        await medusa.store.cart.updateLineItem(cartId, line.id, { quantity: data.quantity });
      }
      await syncDiscount(cartId);
      return linesOf(await retrieveCart(cartId));
    } catch (error) {
      cartFailure(error);
    }
  });

/** A few products to go with the cart: the featured ones it doesn't hold yet. */
const SUGGESTIONS = 3;

/** The cart page: the cart in full, and suggestions to complete it. */
export const getCartPage = createServerFn({ method: "GET" }).handler(async () => {
  keepPrivate();
  const [cart, catalog] = await Promise.all([currentCart(DETAIL_FIELDS), getCatalog()]);
  const details = cart ? await detailsOf(cart, catalog) : null;
  const inCart = new Set(details?.lines.map((line) => line.handle));
  const products = catalog?.products ?? [];
  const suggestions: ProductSummary[] = [
    ...products.filter((product) => product.featuredRank !== null),
    ...products,
  ]
    .filter(
      (product, index, all) =>
        !inCart.has(product.handle) &&
        all.findIndex((other) => other.handle === product.handle) === index,
    )
    .slice(0, SUGGESTIONS);

  return {
    cart: details?.lines.length ? details : null,
    suggestions,
    currencyCode: catalog?.currencyCode ?? "eur",
  };
});

/** Medusa's system provider stands for the payment at pickup. */
const PAY_ON_PICKUP = "pp_system_default";
/** Cards are paid online through the payment provider Medusa names from its config. */
const PAY_BY_CARD = "pp_stripe_stripe";

/**
 * How each payment provider shows at checkout, in this order, the first chosen at first;
 * others aren't offered. The region's providers in Medusa decide which are. Customers read
 * how they pay, never who handles it.
 */
const PAYMENT_METHODS: Record<string, { label: string; description: string }> = {
  [PAY_ON_PICKUP]: {
    label: "Paiement au retrait",
    description: "Vous réglez à la boutique, en venant chercher votre commande.",
  },
  [PAY_BY_CARD]: {
    label: "Carte bancaire",
    description: "Vous réglez maintenant, en ligne.",
  },
};

/** The checkout page: the cart, how to get the order, and how to pay. */
export const getCheckoutPage = createServerFn({ method: "GET" }).handler(async () => {
  keepPrivate();
  const cart = await currentCart(DETAIL_FIELDS);
  if (!cart?.items?.length) throw redirect({ to: "/basket" });

  const region = await retrieveRegion();
  const stripeKey = env.STRIPE_PUBLISHABLE_KEY ?? null;
  const [details, shop, shipping, payment, session] = await Promise.all([
    detailsOf(cart, await getCatalog()),
    getShopInfo(),
    medusa.store.fulfillment.listCartOptions({ cart_id: cart.id }),
    medusa.store.payment.listPaymentProviders({ region_id: region.id }),
    currentCustomer(),
  ]);

  return {
    cart: details,
    // A signed-in customer finds their details filled in.
    customer: session ? customerView(session.customer) : null,
    pickup: shop.contact,
    hours: shop.hours,
    shippingOptions: shipping.shipping_options.map((option) => ({
      id: option.id,
      name: option.name,
      amount: option.calculated_price?.calculated_amount ?? option.amount ?? 0,
      isPickup: option.type?.code === "pickup",
    })),
    paymentMethods: Object.entries(PAYMENT_METHODS).flatMap(([id, method]) => {
      const offered = payment.payment_providers.some((provider) => provider.id === id);
      // Cards need Stripe's public key for their form.
      const online = id === PAY_BY_CARD;
      return offered && (!online || stripeKey) ? [{ id, online, ...method }] : [];
    }),
    stripeKey,
  };
});

const placedOrders = () => (getCookie(ORDERS_COOKIE) ?? "").split(",").filter(Boolean);

const ORDER_FAILED = "La commande n’a pas pu être passée. Réessayez, ou appelez-nous.";

/**
 * Medusa turns the cart into an order, once its payment is authorized. Asked again for a cart
 * already an order, as when Stripe's notice of the payment got there first, it gives that
 * order. The cart cookies go, and the browser may then open the order's confirmation page.
 */
async function completeCart(cartId: string) {
  const result = await medusa.store.cart.complete(cartId);
  if (result.type !== "order") {
    console.error("An order could not be placed", result.error);
    const message = result.error?.message ?? "";
    return {
      error: /stock|inventory/i.test(message)
        ? "Un produit de votre panier n’est plus disponible dans cette quantité : ajustez votre panier, puis réessayez."
        : /payment|authoriz/i.test(message)
          ? "Le paiement n’a pas été accepté. Réessayez, ou choisissez un autre moyen de paiement."
          : ORDER_FAILED,
    } as const;
  }

  forgetCart();
  setCookie(
    ORDERS_COOKIE,
    [result.order.id, ...placedOrders()].slice(0, ORDERS_KEPT).join(","),
    cookieOptions(ORDERS_COOKIE_MAX_AGE),
  );
  return { orderId: result.order.id } as const;
}

/**
 * Places the order: the customer's details on the cart, the pickup as its shipping method,
 * the payment, then Medusa turns the cart into an order. A card is paid in the browser first:
 * the order then waits for `completeOrder`, and the browser gets what it needs to pay.
 */
export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const result = validateCheckout(data);
    if (!result.ok) throw new Error(result.error);
    return result.data;
  })
  .handler(async ({ data }) => {
    const cart = await currentCart(`${LINE_FIELDS},metadata`);
    if (!cart) return { error: "Votre panier est vide." } as const;

    const shop = await getShopInfo();
    const pickup = shop.contact?.address;
    // Orders are picked up at the estate: the address is the shop's, the name the customer's.
    const address = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      address_1: pickup?.street ?? "",
      postal_code: pickup?.postal_code ?? "",
      city: pickup?.city ?? "",
      country_code: pickup?.country_code ?? "fr",
    };
    const byCard = data.paymentProviderId === PAY_BY_CARD;
    // What the customer accepted, in the versions in force, as the order will keep it.
    const versions = await legalVersions();
    const consent: Consent = {
      accepted_at: new Date().toISOString(),
      terms_of_sale: versions["terms-of-sale"],
      privacy_policy: versions.privacy,
    };

    try {
      // A signed-in customer's order goes to their account, and the phone number they gave
      // fills their account's when it has none: the next checkout finds it.
      const session = await currentCustomer();
      if (session) {
        await medusa.store.cart.transferCart(cart.id, {}, authHeaders(session.token));
        if (!session.customer.phone) {
          await medusa.store.customer
            .update({ phone: data.phone }, {}, authHeaders(session.token))
            .catch((error) => console.error("The customer's phone could not be saved", error));
        }
      }
      await medusa.store.cart.update(cart.id, {
        email: data.email,
        shipping_address: address,
        billing_address: address,
        metadata: { ...cart.metadata, [CONSENT_KEY]: consent },
      });
      await medusa.store.cart.addShippingMethod(cart.id, { option_id: data.shippingOptionId });
      await syncDiscount(cart.id);
      const { cart: payable } = await medusa.store.cart.retrieve(cart.id, {
        fields: "id,payment_collection.id",
      });
      // A new payment replaces the cart's last one, such as a card refused a moment ago.
      const { payment_collection } = await medusa.store.payment.initiatePaymentSession(payable, {
        provider_id: data.paymentProviderId,
        ...(byCard ? { data: { payment_method_types: CARD_PAYMENT_METHODS } } : {}),
      });
      if (!byCard) return await completeCart(cart.id);

      const clientSecret = payment_collection.payment_sessions?.find(
        (payment) => payment.provider_id === PAY_BY_CARD,
      )?.data?.client_secret;
      if (typeof clientSecret !== "string") throw new Error("Stripe gave no client secret");
      return { clientSecret } as const;
    } catch (error) {
      console.error("An order could not be placed", error);
      return { error: ORDER_FAILED } as const;
    }
  });

/** Places the order once its card is paid: Medusa checks the payment with Stripe. */
export const completeOrder = createServerFn({ method: "POST" }).handler(async () => {
  // The cart may already be an order: `currentCart` would take it for gone.
  const cartId = getCookie(CART_COOKIE);
  if (!cartId) return { error: "Votre panier est vide." } as const;
  try {
    return await completeCart(cartId);
  } catch (error) {
    console.error("An order could not be placed", error);
    return { error: ORDER_FAILED } as const;
  }
});

/**
 * An order's page once placed: what was ordered, where to pick it up, and how it's paid. It
 * holds the customer's name and e-mail: only the browser that placed the order, or the
 * signed-in customer it belongs to, may open it.
 */
export const getOrderConfirmation = createServerFn({ method: "GET" })
  .validator(z.object({ orderId: z.string().check(z.minLength(1)) }))
  .handler(async ({ data }) => {
    keepPrivate();
    const placedHere = placedOrders().includes(data.orderId);
    const session = await currentCustomer();
    if (!placedHere && !session) throw notFound();

    const [{ order }, shop, orderDiscount, content] = await Promise.all([
      medusa.store.order
        .retrieve(
          data.orderId,
          {
            fields: [
              "id",
              "display_id",
              "email",
              "customer_id",
              "currency_code",
              "original_item_total",
              "discount_total",
              "total",
              // The store API only returns these relations in full.
              "*shipping_address",
              "items.id",
              "items.quantity",
              "items.unit_price",
              "items.product_title",
              "items.product_handle",
              "items.variant_title",
              "items.thumbnail",
              "*payment_collections.payment_sessions",
            ].join(","),
          },
          session && !placedHere ? authHeaders(session.token) : undefined,
        )
        .catch(() => {
          throw notFound();
        }),
      getShopInfo(),
      orderDiscountLabel(data.orderId),
      readGlobal("order-confirmation"),
    ]);
    const ownOrder = Boolean(session && order.customer_id === session.customer.id);
    if (!placedHere && !ownOrder) throw notFound();

    const paidOnPickup = (order.payment_collections ?? []).some((collection) =>
      collection.payment_sessions?.some((payment) => payment.provider_id === PAY_ON_PICKUP),
    );

    return {
      order: {
        id: order.id,
        displayId: order.display_id,
        email: order.email ?? null,
        firstName: order.shipping_address?.first_name ?? null,
        currencyCode: order.currency_code,
        subtotal: order.original_item_total ?? 0,
        discount: order.discount_total ?? 0,
        total: order.total ?? 0,
        discountLabel: orderDiscount,
        paidOnPickup,
        /** A signed-in customer follows the order from their account; a guest, by e-mail. */
        inAccount: ownOrder,
        lines: (order.items ?? []).map((item) => ({
          id: item.id,
          title: item.product_title ?? "",
          format: item.variant_title ?? null,
          quantity: item.quantity,
          total: (item.unit_price ?? 0) * item.quantity,
        })),
      },
      pickup: shop.contact,
      hours: shop.hours,
      content,
    };
  });
