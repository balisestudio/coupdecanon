import { parseAsBoolean, parseAsStringLiteral } from "nuqs/server";
import type { ProductSummary } from "./catalog.server";
import { searchSchema } from "./search-params";

/** The shop's orders, in the sort menu's order, by their value in the URL; the first is the default. */
export const SORTS = {
  favorites: "Nos préférés",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  newest: "Nouveautés",
} as const;

export type Sort = keyof typeof SORTS;

export const DEFAULT_SORT: Sort = "favorites";

/**
 * The shop pages' query string, technical and so in English: `?alcohol-free=true&sort=price-asc`.
 * Defaults stay out of the URL, so the plain pages keep a single address.
 */
export const shopParsers = {
  sort: parseAsStringLiteral(Object.keys(SORTS) as Sort[]).withDefault(DEFAULT_SORT),
  "alcohol-free": parseAsBoolean.withDefault(false),
};

export const shopSearch = searchSchema(shopParsers);

export type ShopSearch = ReturnType<typeof shopSearch>;

export const isFiltered = (search: ShopSearch) =>
  Boolean(search["alcohol-free"] || (search.sort && search.sort !== DEFAULT_SORT));

const priceOf = (product: ProductSummary) => product.price?.amount ?? Number.POSITIVE_INFINITY;

/** The products the query string keeps, in its order. The catalog comes in favorites order. */
export function selectProducts(products: ProductSummary[], search: ShopSearch) {
  const kept = search["alcohol-free"]
    ? products.filter((product) => product.alcoholFree)
    : [...products];

  switch (search.sort ?? DEFAULT_SORT) {
    case "price-asc":
      return kept.sort((a, b) => priceOf(a) - priceOf(b));
    case "price-desc":
      return kept.sort((a, b) => priceOf(b) - priceOf(a));
    case "newest":
      return kept.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return kept;
  }
}

/**
 * How a family shows on the shop's main page:
 * - `feature-start` and `feature-end`: its first product in large, the next ones listed beside
 *   it, on the left or the right;
 * - `row`: a row of cards, every other one set lower;
 * - `list`: compact rows in two columns, for the families with small items.
 */
export type SectionLayout = "feature-start" | "row" | "feature-end" | "list";

const LAYOUTS: SectionLayout[] = ["feature-start", "row", "feature-end", "list"];

/**
 * The families' layouts, in order: they take the layouts in turn, save the families of one or
 * two products, which make a short list and let the next family take their turn.
 */
export function layoutsOf(productCounts: number[]): SectionLayout[] {
  let turn = 0;
  return productCounts.map((count) =>
    count < 3 ? "list" : (LAYOUTS[turn++ % LAYOUTS.length] ?? "row"),
  );
}

/** The main page shows a few products per family, then links to the family's page. */
export const PRODUCTS_PER_SECTION: Record<SectionLayout, number> = {
  "feature-start": 4,
  row: 4,
  "feature-end": 4,
  list: 6,
};

/**
 * On a family's page, the products the grid sets in large: from five products on, one every
 * nine on desktop, alternating left and right, and one every seven on phones.
 */
export function highlightsOf(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const desktop = index % 9 === 0 && count - index >= 5;
    return {
      desktop: desktop ? ((index / 9) % 2 === 0 ? "start" : "end") : null,
      mobile: index % 7 === 0 && count >= 5,
    } as const;
  });
}
