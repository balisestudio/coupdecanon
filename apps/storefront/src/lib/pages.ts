import type { LegalDocumentSlug } from "@coupdecanon/config/legal";
import { env } from "@coupdecanon/config/storefront-env";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCatalog, getHomeCatalog } from "./catalog.server";
import { getCms, readGlobal } from "./cms.server";
import { listFamilyContent } from "./families.server";
import { formatFromPrice } from "./format";
import { readLegalDocument } from "./legal.server";
import { getShopInfo } from "./shop.server";

/**
 * What the site's content pages render on the server: their content from Payload, with what
 * they show of the shop and its catalog.
 */

const siteUrl = () => env.STOREFRONT_URL.replace(/\/$/, "");

/** The estate's awards, the latest first. */
async function listAwards() {
  const cms = await getCms();
  const { docs } = await cms.find({ collection: "awards", sort: "-year", limit: 50, depth: 0 });
  return docs.map(({ id, year, title, summary, detail }) => ({ id, year, title, summary, detail }));
}

export const getHomePage = createServerFn({ method: "GET" }).handler(async () => {
  const [catalog, shop, content, orchard, common, awards, families] = await Promise.all([
    getHomeCatalog(),
    getShopInfo(),
    readGlobal("home"),
    readGlobal("orchard"),
    readGlobal("common"),
    listAwards(),
    listFamilyContent(),
  ]);
  return {
    siteUrl: siteUrl(),
    catalog,
    shop,
    content,
    varieties: (orchard.apples?.varieties ?? []).map((variety) => variety.name),
    visit: common.visit,
    awards,
    families,
  };
});

export const getEstatePage = createServerFn({ method: "GET" }).handler(async () => {
  const [shop, content, common, awards] = await Promise.all([
    getShopInfo(),
    readGlobal("estate"),
    readGlobal("common"),
    listAwards(),
  ]);
  return { siteUrl: siteUrl(), shop, content, visit: common.visit, awards };
});

export const getOrchardPage = createServerFn({ method: "GET" }).handler(async () => {
  const content = await readGlobal("orchard");
  return { siteUrl: siteUrl(), content };
});

export const getHelpPage = createServerFn({ method: "GET" }).handler(async () => {
  const [shop, content] = await Promise.all([getShopInfo(), readGlobal("help")]);
  return { siteUrl: siteUrl(), shop, content };
});

/** The weddings page, with the price of the product its text quotes, from the catalog. */
export const getWeddingsPage = createServerFn({ method: "GET" }).handler(async () => {
  const [shop, content, catalog] = await Promise.all([
    getShopInfo(),
    readGlobal("weddings"),
    getCatalog(),
  ]);
  const productId = content.offer?.miniatures?.product;
  const product = catalog?.products.find((candidate) => candidate.id === productId);
  return {
    siteUrl: siteUrl(),
    shop,
    content,
    price: product?.price && catalog ? formatFromPrice(product.price, catalog.currencyCode) : null,
  };
});

/** A legal document's page, and the shop's details its text quotes. */
export const getLegalPage = createServerFn({ method: "GET" })
  .validator((slug: LegalDocumentSlug) => slug)
  .handler(async ({ data: slug }) => {
    const [shop, document] = await Promise.all([getShopInfo(), readLegalDocument(slug)]);
    if (!document) throw notFound();
    return { siteUrl: siteUrl(), shop, document };
  });
