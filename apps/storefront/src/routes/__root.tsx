import { withPayloadRoot } from "@payloadcms/tanstack-start/client";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * The document every page shares: the site's pages under `_site`, Payload's admin and API
 * under `_payload`. Payload renders its own document for the admin, with its own styles.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  }),
  // Every page: no framing by other sites, no guessing of file types, a referrer that stops at
  // the origin for other sites, and no access to the camera, microphone or location.
  headers: () => ({
    "Content-Security-Policy":
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    ...(import.meta.env.PROD
      ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
      : {}),
  }),
  shellComponent: withPayloadRoot(RootDocument),
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
