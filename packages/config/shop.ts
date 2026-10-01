/**
 * The shop's brand, shared by the storefront and the e-mails. Its contact details and legal
 * identity are the store's metadata instead, edited in the admin: see `shop-info.ts`.
 */
export const SHOP = {
  name: "Coup de Canon",
  tagline: "La boutique du Domaine de Ouézy",
  estate: "Domaine de Ouézy",
  foundingYear: 1995,
} as const;

/** Catalog conventions the admin team follows and the storefront relies on. */
export const CATALOG = {
  /** The tag of products sold only at the estate. */
  domainOnlyTag: "Uniquement au domaine",
  /**
   * The product types, which are tax classes: each sets the VAT rate of its products. The
   * shop's "Sans alcool" filter keeps every product that isn't an alcoholic drink.
   */
  taxClasses: { alcohol: "Boisson alcoolisée", food: "Alimentaire", other: "Autre" },
} as const;
