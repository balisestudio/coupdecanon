import { SHOP } from "@coupdecanon/config/shop";
import { Toaster } from "@coupdecanon/ui/components/sonner";
import { PRELOAD_FONTS } from "@coupdecanon/ui/lib/fonts";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { AgeGate } from "../components/age-gate";
import { CartProvider } from "../components/cart";
import { CartToast } from "../components/cart-toast";
import { Container } from "../components/container";
import { GridOverlay } from "../components/grid-overlay";
import { NavigationProgress, RouteAnnouncer } from "../components/navigation-feedback";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { SiteLink } from "../components/site-link";
import { UnderlineReplay } from "../components/underline-replay";
import { getLayout } from "../lib/layout";
import appCss from "../styles.css?url";

/** The site's pages: their styles and fonts, the header and the footer around each. */
export const Route = createFileRoute("/_site")({
  loader: () => getLayout(),
  // The header's and the footer's content change rarely: navigating doesn't ask again.
  staleTime: 5 * 60_000,
  head: () => ({
    meta: [
      { title: SHOP.name },
      // The forest green of the design (`--color-forest`).
      { name: "theme-color", content: "#1f3a2a" },
      { property: "og:site_name", content: SHOP.name },
      { property: "og:locale", content: "fr_FR" },
    ],
    links: [
      ...PRELOAD_FONTS.map((font) => ({
        rel: "preload",
        as: "font",
        href: font.href,
        type: font.type,
        crossOrigin: "anonymous" as const,
      })),
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: SiteLayout,
  notFoundComponent: NotFound,
});

function SiteLayout() {
  const { shop, header, footer, ageGate, families, legalLinks } = Route.useLoaderData();

  return (
    <NuqsAdapter>
      <CartProvider>
        <div className="flex min-h-svh flex-col">
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
          >
            Aller au contenu
          </a>
          <SiteHeader contact={shop.contact} header={header} />
          <NavigationProgress />
          <RouteAnnouncer />
          <main id="content" tabIndex={-1} className="grow outline-none">
            <Outlet />
          </main>
          <SiteFooter
            contact={shop.contact}
            footer={footer}
            families={families}
            legalLinks={legalLinks}
          />
          <Toaster />
          <CartToast />
          <AgeGate content={ageGate} />
          {import.meta.env.DEV ? <GridOverlay /> : null}
          <UnderlineReplay />
        </div>
      </CartProvider>
    </NuqsAdapter>
  );
}

function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-stack pt-block pb-section text-center">
      <h1 className="text-4xl">Page introuvable</h1>
      <p className="max-w-text text-lg">
        Cette page n’existe pas, ou plus. La boutique du domaine, elle, est toujours là.
      </p>
      <SiteLink href="/" className="link-underline">
        Revenir à l’accueil
      </SiteLink>
    </Container>
  );
}
