import { CATALOG } from "@coupdecanon/config/shop";
import { setResponseHeader } from "@tanstack/react-start/server";
import { readGlobal } from "./cms.server";
import { medusa, type StoreProduct } from "./medusa.server";
import { PATHS } from "./paths";

export type ProductSummary = {
  /** Medusa's id, which Payload's content refers to. */
  id: string;
  handle: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  /** The product's own family's name, for its stand-in picture and structured data. */
  family: string | null;
  /** The handles of all the families (categories) the product belongs to. */
  families: string[];
  /** Its page, in its own family: the first of its families, in the team's order. */
  path: string;
  /** The lowest price across formats, tax included. */
  price: { amount: number; highest: number; varies: boolean } | null;
  domainOnly: boolean;
  alcoholFree: boolean;
  /** Its place among the products the home page features, in Payload, or `null`. */
  featuredRank: number | null;
  /** The product's formats, such as "75 cl", each with its price, tax included. */
  formats: ProductFormat[];
  createdAt: string;
};

/**
 * A format of a product, such as "75 cl". When the team tracks its stock in Medusa, the
 * format holds as many as are left, and none once sold out, unless it takes backorders.
 */
export type ProductFormat = {
  variantId: string;
  title: string;
  price: number | null;
  /** Whether it can go in the cart now. */
  available: boolean;
  /** How many the cart may hold, when the stock sets it. */
  maxQuantity: number | null;
};

/**
 * A family of products: a top-level product category, its page at its handle. What the site
 * says and shows of it, its introduction and photo, is Payload's (see `families.server.ts`).
 */
export type Family = {
  /** Medusa's id, which Payload's content refers to. */
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type FamilyDefinition = Omit<Family, "productCount">;

/** The whole published catalog, which the home page and the shop pages draw from. */
export type Catalog = {
  currencyCode: string;
  /** Every product, the admin team's favorites first, then the oldest first. */
  products: ProductSummary[];
  /** The families with products, in the order the admin team defined them. */
  families: Family[];
};

export type HomeCatalog = {
  currencyCode: string;
  productCount: number;
  featured: ProductSummary[];
  families: Family[];
};

export const PRODUCT_FIELDS = [
  "id",
  "handle",
  "title",
  "subtitle",
  "thumbnail",
  "created_at",
  "type.value",
  "*tags",
  // The store API only returns a product's categories in full.
  "*categories",
  "variants.id",
  "variants.title",
  "variants.manage_inventory",
  "variants.allow_backorder",
  // The stock left, which the store API only gives when asked with a "+".
  "+variants.inventory_quantity",
  "*variants.calculated_price",
].join(",");

/** More than the estate will ever sell: the whole catalog comes in one request. */
const MAX_PRODUCTS = 200;

/** The catalog changes a few times a week: every server keeps it this long. */
const CACHE_TTL_MS = 60_000;

let cache: { value: Catalog; expiresAt: number } | null = null;

/**
 * A product's own family: the first of its families in the team's order, where its page
 * lives. A product in no family has no page, and the shop leaves it out.
 */
export const homeFamilyOf = (product: StoreProduct, families: FamilyDefinition[]) =>
  families.find((family) =>
    (product.categories ?? []).some((category) => category.handle === family.slug),
  ) ?? null;

export function summarize(
  product: StoreProduct,
  home: FamilyDefinition,
  featured: string[] = [],
): ProductSummary {
  const featuredRank = featured.indexOf(product.id);
  const variants = product.variants ?? [];
  const amounts = variants
    .map((variant) => variant.calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === "number");
  const lowest = amounts.length ? Math.min(...amounts) : null;
  const highest = amounts.length ? Math.max(...amounts) : null;
  const tags = new Set((product.tags ?? []).map((tag) => tag.value));

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    subtitle: product.subtitle ?? null,
    thumbnail: product.thumbnail ?? null,
    family: home.name,
    families: (product.categories ?? []).map((category) => category.handle),
    path: PATHS.product(home.slug, product.handle),
    price:
      lowest === null || highest === null
        ? null
        : { amount: lowest, highest, varies: lowest !== highest },
    domainOnly: tags.has(CATALOG.domainOnlyTag),
    // Product types are tax classes. Only the food and "other" classes vouch for no alcohol:
    // a product saved without a type isn't listed as alcohol-free.
    alcoholFree: [CATALOG.taxClasses.food, CATALOG.taxClasses.other].some(
      (taxClass) => taxClass === product.type?.value,
    ),
    featuredRank: featuredRank === -1 ? null : featuredRank,
    formats: variants.map((variant) => {
      // Without stock tracking, or with backorders, a format never runs out.
      const limited = Boolean(variant.manage_inventory) && !variant.allow_backorder;
      const left = Math.max(0, variant.inventory_quantity ?? 0);
      return {
        variantId: variant.id,
        title: variant.title ?? "",
        price: variant.calculated_price?.calculated_amount ?? null,
        available: !limited || left > 0,
        maxQuantity: limited ? left : null,
      };
    }),
    createdAt: String(product.created_at ?? ""),
  };
}

export async function retrieveRegion() {
  const { regions } = await medusa.store.region.list({ fields: "id,currency_code" });
  const region = regions.find((candidate) => candidate.currency_code === "eur") ?? regions[0];
  if (!region) throw new Error("Medusa has no region: run the seed");
  return region;
}

/** The top-level categories, in the order the admin team set. */
export async function listFamilyDefinitions(): Promise<FamilyDefinition[]> {
  const { product_categories: categories } = await medusa.store.category.list({
    parent_category_id: "null",
    fields: "id,name,handle,rank",
    order: "rank",
    limit: 100,
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.handle,
  }));
}

const rankOf = (product: ProductSummary) => product.featuredRank ?? Number.POSITIVE_INFINITY;

/** The featured products first, in their order, then the catalog's: the oldest first. */
export const byFavorites = (a: ProductSummary, b: ProductSummary) =>
  rankOf(a) - rankOf(b) || a.createdAt.localeCompare(b.createdAt);

/** Whether a product belongs to a family. */
export const inFamily = (product: ProductSummary, family: Pick<Family, "slug">) =>
  product.families.includes(family.slug);

/** The families of these products, in the admin team's order, with how many each has. */
export function familiesOf(products: ProductSummary[], order: FamilyDefinition[]): Family[] {
  return order
    .map((family) => ({
      ...family,
      productCount: products.filter((product) => inFamily(product, family)).length,
    }))
    .filter((family) => family.productCount > 0);
}

/** The products the home page features, as the team picked them in Payload, in order. */
export async function featuredProductIds() {
  const home = await readGlobal("home");
  return home.cellar?.products ?? [];
}

async function loadCatalog(): Promise<Catalog> {
  const [region, familyDefinitions, featured] = await Promise.all([
    retrieveRegion(),
    listFamilyDefinitions(),
    featuredProductIds(),
  ]);
  const { products } = await medusa.store.product.list({
    region_id: region.id,
    fields: PRODUCT_FIELDS,
    limit: MAX_PRODUCTS,
  });
  const summaries = products
    .flatMap((product) => {
      const home = homeFamilyOf(product, familyDefinitions);
      if (!home) {
        console.warn(`"${product.handle}" is in no family: the shop leaves it out`);
        return [];
      }
      return [summarize(product, home, featured)];
    })
    .sort(byFavorites);

  return {
    currencyCode: region.currency_code,
    products: summaries,
    families: familiesOf(summaries, familyDefinitions),
  };
}

/**
 * The published catalog, kept for a minute, as are the featured products' places: a change
 * in Medusa or Payload shows within the minute. When Medusa can't be reached, pages still
 * render with the last catalog loaded, or without their catalog sections.
 */
export async function getCatalog(): Promise<Catalog | null> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  try {
    const value = await loadCatalog();
    cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch (error) {
    console.error("The catalog could not be loaded from Medusa", error);
    return cache?.value ?? null;
  }
}

/**
 * The catalog, for pages that are nothing without it, such as the shop's: without one, the
 * page fails, shows the error page and isn't cached, rather than being served empty.
 */
export async function requireCatalog(): Promise<Catalog> {
  const catalog = await getCatalog();
  if (!catalog) {
    setResponseHeader("Cache-Control", "no-store");
    throw new Error("The catalog is unavailable: Medusa can't be reached");
  }
  return catalog;
}

/** A product's page, from its handle, as the catalog knows it: `null` for one it doesn't. */
export const pathOf = (catalog: Catalog | null, handle: string | null | undefined) =>
  (handle && catalog?.products.find((product) => product.handle === handle)?.path) || null;

/** What the home page shows of the catalog: three favorites and the families. */
export async function getHomeCatalog(): Promise<HomeCatalog | null> {
  const catalog = await getCatalog();
  if (!catalog) return null;

  // The catalog comes featured products first, in their order.
  const favorites = catalog.products.filter((product) => product.featuredRank !== null);
  return {
    currencyCode: catalog.currencyCode,
    productCount: catalog.products.length,
    // Every featured product, however many. Without any, the three latest products.
    featured: favorites.length
      ? favorites
      : [...catalog.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    families: catalog.families,
  };
}
