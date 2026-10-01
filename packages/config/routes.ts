/** "Cidre & Poiré" → "cidre-poire". */
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The storefront's URLs, shared by the storefront and the e-mails that link to it. They're in
 * English, in the estate's own words: the shop is its cellar, where each family of products
 * has its shelf and each product its place on it. Handles are Medusa's, as the team names
 * its families and products.
 */
export const PATHS = {
  home: "/",
  shop: "/cellar",
  /** A family of products is a top-level product category, at its handle. */
  family: (family: string) => `/cellar/${family}`,
  /** A product lives in its family: the first of its families, in the team's order. */
  product: (family: string, handle: string) => `/cellar/${family}/${handle}`,
  estate: "/the-estate",
  awards: "/the-estate#awards",
  orchard: "/the-orchard",
  weddings: "/weddings",
  quote: "/weddings#quote",
  help: "/help",
  delivery: "/help#pickup",
  contact: "/help#contact",
  legalNotice: "/legal-notice",
  termsOfSale: "/terms-of-sale",
  termsOfUse: "/terms-of-use",
  privacy: "/privacy",
  search: "/search",
  cart: "/basket",
  checkout: "/checkout",
  orderConfirmation: (orderId: string) => `/checkout/confirmation/${orderId}`,
  account: "/account",
  accountOrder: (orderId: string) => `/account/orders/${orderId}`,
  accountDetails: "/account/details",
  login: "/account/sign-in",
  register: "/account/sign-up",
  forgotPassword: "/account/forgot-password",
  resetPassword: "/account/reset-password",
} as const;
