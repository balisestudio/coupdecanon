import { env } from "@coupdecanon/config/storefront-env";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod/mini";
import { getCatalog, inFamily, type ProductSummary } from "./catalog.server";
import { readGlobal } from "./cms.server";
import { PATHS } from "./paths";

/** Searches start from this many letters. */
export const MIN_QUERY_LENGTH = 2;

/** "Épicerie" → "epicerie": searches ignore case and accents. */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * The site's pages a search can also lead to: their titles, and the summary and the words that
 * find them, as the team sets them in each page's "Référencement" tab in Payload.
 */
async function sitePages() {
  const [orchard, estate, weddings, help] = await Promise.all([
    readGlobal("orchard"),
    readGlobal("estate"),
    readGlobal("weddings"),
    readGlobal("help"),
  ]);
  return [
    { content: orchard, href: PATHS.orchard },
    { content: estate, href: PATHS.estate },
    { content: weddings, href: PATHS.weddings },
    { content: help, href: PATHS.help },
  ].map(({ content, href }) => ({
    name: content.hero.title,
    text: content.search.summary,
    href,
    keywords: content.search.keywords ?? "",
  }));
}

/** Every word of the query must appear somewhere in what describes the item. */
const matches = (haystack: string, words: string[]) => {
  const text = normalize(haystack);
  return words.every((word) => text.includes(word));
};

export const getSearchPage = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.optional(z.string()) }))
  .handler(async ({ data }) => {
    const siteUrl = env.STOREFRONT_URL.replace(/\/$/, "");
    const query = (data.q ?? "").trim();
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const searchPage = await readGlobal("search");
    const suggestions = (searchPage.suggestions ?? []).map((suggestion) => suggestion.term);
    if (query.length < MIN_QUERY_LENGTH) {
      return { siteUrl, query, suggestions, currencyCode: "eur", products: [], pages: [] };
    }

    const [catalog, pages] = await Promise.all([getCatalog(), sitePages()]);
    const describe = (product: ProductSummary) =>
      [
        product.title,
        product.subtitle,
        ...(catalog?.families ?? [])
          .filter((family) => inFamily(product, family))
          .map((family) => family.name),
        product.alcoholFree ? "sans alcool" : "",
        product.formats.map((format) => format.title).join(" "),
      ].join(" ");

    return {
      siteUrl,
      query,
      suggestions,
      currencyCode: catalog?.currencyCode ?? "eur",
      products: (catalog?.products ?? []).filter((product) => matches(describe(product), words)),
      pages: pages.filter((page) => matches(`${page.name} ${page.text} ${page.keywords}`, words)),
    };
  });
