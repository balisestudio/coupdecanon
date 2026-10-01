import { env } from "@coupdecanon/config/storefront-env";
import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod/mini";
import {
  type Family,
  featuredProductIds,
  getCatalog,
  homeFamilyOf,
  inFamily,
  listFamilyDefinitions,
  PRODUCT_FIELDS,
  type ProductSummary,
  retrieveRegion,
  summarize,
} from "./catalog.server";
import { getCms, readGlobal } from "./cms.server";
import { medusa } from "./medusa.server";
import { getShopInfo } from "./shop.server";

/** How many products of the same family the page suggests. */
const RELATED_PRODUCTS = 3;

export type ProductDetail = ProductSummary & {
  description: string | null;
  /** Its photos, the first one leading. */
  images: string[];
  /** Its own family, which its page and breadcrumb go through. */
  parentFamily: Pick<Family, "name" | "slug">;
  making: string | null;
  steps: { title: string; text: string }[];
};

/** A product in full, or `null` for one unknown, or in no family, which has no page. */
/** A product's story, which the team writes in Payload: how it's made, and its steps. */
async function readStory(productId: string) {
  const cms = await getCms();
  const { docs } = await cms.find({
    collection: "product-stories",
    where: { product: { equals: productId } },
    depth: 0,
    limit: 1,
  });
  const story = docs[0];
  return {
    making: story?.making || null,
    steps: (story?.steps ?? []).map(({ title, text }) => ({ title, text })),
  };
}

async function retrieveProduct(handle: string): Promise<ProductDetail | null> {
  const [region, families, featured] = await Promise.all([
    retrieveRegion(),
    listFamilyDefinitions(),
    featuredProductIds(),
  ]);
  const { products } = await medusa.store.product.list({
    handle,
    region_id: region.id,
    fields: `${PRODUCT_FIELDS},description,*images`,
    limit: 1,
  });
  const product = products[0];
  const home = product ? homeFamilyOf(product, families) : null;
  if (!product || !home) return null;

  const images = (product.images ?? []).map((image) => image.url);
  return {
    ...summarize(product, home, featured),
    description: product.description || null,
    images: images.length ? images : product.thumbnail ? [product.thumbnail] : [],
    parentFamily: { name: home.name, slug: home.slug },
    ...(await readStory(product.id)),
  };
}

/**
 * A product's page: the product in full, a few of its family's others, the shop's details.
 * Asked for in another family than its own, as after the team moved it, it redirects there.
 */
export const getProductPage = createServerFn({ method: "GET" })
  .validator(
    z.object({
      family: z.string().check(z.minLength(1)),
      handle: z.string().check(z.minLength(1)),
    }),
  )
  .handler(async ({ data: { family, handle } }) => {
    const [product, catalog, shop, content] = await Promise.all([
      retrieveProduct(handle),
      getCatalog(),
      getShopInfo(),
      readGlobal("product-page"),
    ]);
    if (!product) throw notFound();
    if (product.parentFamily.slug !== family)
      throw redirect({ href: product.path, statusCode: 301 });

    const { parentFamily } = product;
    const related = (catalog?.products ?? [])
      .filter((other) => other.handle !== product.handle && inFamily(other, parentFamily))
      .slice(0, RELATED_PRODUCTS);

    return {
      siteUrl: env.STOREFRONT_URL.replace(/\/$/, ""),
      currencyCode: catalog?.currencyCode ?? "eur",
      product,
      related,
      contact: shop.contact,
      content,
    };
  });
