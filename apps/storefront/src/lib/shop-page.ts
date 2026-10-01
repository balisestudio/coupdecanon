import { env } from "@coupdecanon/config/storefront-env";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type Family, inFamily, type ProductSummary, requireCatalog } from "./catalog.server";
import { getCms, readGlobal } from "./cms.server";
import {
  layoutsOf,
  PRODUCTS_PER_SECTION,
  type ShopSearch,
  selectProducts,
  shopSearch,
} from "./shop";

const siteUrl = () => env.STOREFRONT_URL.replace(/\/$/, "");

async function loadSelection(search: ShopSearch) {
  const catalog = await requireCatalog();
  const products = selectProducts(catalog.products, search);
  return {
    catalog,
    products,
    // Every family, its count following the filter, for the family links.
    families: catalog.families.map((family) => ({
      ...family,
      productCount: products.filter((product) => inFamily(product, family)).length,
    })),
  };
}

/** The main page's sections: each family with products, in its layout, a few products each. */
function sectionsOf(families: Family[], products: ProductSummary[]) {
  const withProducts = families
    .map((family) => ({
      family,
      products: products.filter((product) => inFamily(product, family)),
    }))
    .filter((section) => section.products.length > 0);
  const layouts = layoutsOf(withProducts.map((section) => section.products.length));

  return withProducts.map((section, index) => {
    const layout = layouts[index] ?? "row";
    return {
      ...section,
      layout,
      products: section.products.slice(0, PRODUCTS_PER_SECTION[layout]),
    };
  });
}

/** A family's introduction, which the team writes in Payload, or `null`. */
async function familyIntroduction(categoryId: string) {
  const cms = await getCms();
  const { docs } = await cms.find({
    collection: "families",
    where: { category: { equals: categoryId } },
    depth: 0,
    limit: 1,
    select: { introduction: true },
  });
  return docs[0]?.introduction || null;
}

/** The shop's main page: every family, a few of its products each, filtered and sorted. */
export const getShopPage = createServerFn({ method: "GET" })
  .validator(shopSearch)
  .handler(async ({ data: search }) => {
    const [selection, content] = await Promise.all([loadSelection(search), readGlobal("shop")]);

    const { catalog, products, families } = selection;
    return {
      siteUrl: siteUrl(),
      content,
      shop: {
        currencyCode: catalog.currencyCode,
        catalogSize: catalog.products.length,
        selectedCount: products.length,
        families,
        sections: sectionsOf(families, products),
      },
    };
  });

/** A family's page: all its products, filtered and sorted. */
export const getFamilyPage = createServerFn({ method: "GET" })
  .validator((data: Record<string, unknown>) => {
    const { slug } = data ?? {};
    if (typeof slug !== "string" || !slug) throw new Error("A family's page needs its handle");
    return { ...shopSearch(data), slug };
  })
  .handler(async ({ data: { slug, ...search } }) => {
    const selection = await loadSelection(search);

    const { catalog, products, families } = selection;
    const family = catalog.families.find((candidate) => candidate.slug === slug);
    if (!family) throw notFound();

    return {
      siteUrl: siteUrl(),
      introduction: await familyIntroduction(family.id),
      shop: {
        currencyCode: catalog.currencyCode,
        catalogSize: catalog.products.length,
        selectedCount: products.length,
        families,
        family,
        products: products.filter((product) => inFamily(product, family)),
      },
    };
  });
