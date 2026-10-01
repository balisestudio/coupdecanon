import { createFileRoute } from "@tanstack/react-router";
import { PATHS } from "../lib/paths";

/** The pages search engines should index, besides the shop's families and products. */
const PAGES = [
  PATHS.home,
  PATHS.shop,
  PATHS.estate,
  PATHS.orchard,
  PATHS.weddings,
  PATHS.help,
  PATHS.legalNotice,
  PATHS.termsOfSale,
  PATHS.termsOfUse,
  PATHS.privacy,
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { env } = await import("@coupdecanon/config/storefront-env");
        const { getCatalog } = await import("../lib/catalog.server");
        const siteUrl = env.STOREFRONT_URL.replace(/\/$/, "");
        const catalog = await getCatalog();
        const urls = [
          ...PAGES,
          ...(catalog?.families ?? []).map((family) => PATHS.family(family.slug)),
          ...(catalog?.products ?? []).map((product) => product.path),
        ].map((path) => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`);
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
