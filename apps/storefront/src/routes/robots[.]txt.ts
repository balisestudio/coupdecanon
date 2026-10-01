import { createFileRoute } from "@tanstack/react-router";
import { PATHS } from "../lib/paths";

/** Pages that belong to one visitor, and have nothing to offer search engines. */
const PRIVATE_PATHS = [PATHS.account, PATHS.cart, PATHS.checkout];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { env } = await import("@coupdecanon/config/storefront-env");
        const siteUrl = env.STOREFRONT_URL.replace(/\/$/, "");
        const body = [
          "User-agent: *",
          ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
