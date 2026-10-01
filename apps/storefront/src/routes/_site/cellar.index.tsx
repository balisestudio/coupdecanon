import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { Container } from "../../components/container";
import { ShopFilters } from "../../components/shop-filters";
import { EmptyShop, FamilySection, ShopHero, ShopQuote } from "../../components/shop-sections";
import { fillIn } from "../../lib/content";
import { pluralizeProducts } from "../../lib/format";
import { PATHS } from "../../lib/paths";
import { breadcrumbJsonLd, pageMeta, pageTitle, productListJsonLd } from "../../lib/seo";
import { isFiltered, shopSearch } from "../../lib/shop";
import { getShopPage } from "../../lib/shop-page";

/** The quote sits after this many families, when more follow. */
const QUOTE_AFTER = 2;

export const Route = createFileRoute("/_site/cellar/")({
  validateSearch: shopSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getShopPage({ data: deps }),
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const { siteUrl, shop, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: PATHS.shop,
      title: pageTitle(content.seo.title),
      description: content.seo.description,
      noindex: isFiltered(match.search),
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: content.hero.title, path: PATHS.shop },
        ]),
        ...(shop
          ? [
              productListJsonLd(
                siteUrl,
                content.hero.title,
                shop.sections.flatMap((section) => section.products),
                shop.currencyCode,
              ),
            ]
          : []),
      ],
    };
  },
  // Shared caches may serve the page for five minutes, then revalidate it in the background.
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  }),
  component: Shop,
});

function Shop() {
  const { shop, content } = Route.useLoaderData();
  const search = Route.useSearch();
  const introduction = fillIn(content.hero.text, {
    produits: shop ? pluralizeProducts(shop.catalogSize) : null,
  });

  return (
    <div className="pb-section">
      <ShopHero title={content.hero.title}>
        {introduction ? <p className="text-lg">{introduction}</p> : null}
      </ShopHero>
      {shop ? (
        <>
          <ShopFilters
            families={shop.families}
            selectedCount={shop.selectedCount}
            activeFamily={null}
            search={search}
          />
          {shop.sections.length ? (
            shop.sections.map((section, index) => (
              <Fragment key={section.family.slug}>
                <FamilySection {...section} currencyCode={shop.currencyCode} search={search} />
                {index === QUOTE_AFTER - 1 && shop.sections.length > QUOTE_AFTER ? (
                  <ShopQuote text={content.quote.text} caption={content.quote.caption} />
                ) : null}
              </Fragment>
            ))
          ) : (
            <EmptyShop search={search} />
          )}
        </>
      ) : (
        <Container>
          <p className="text-lg text-muted-foreground">
            La boutique est momentanément indisponible. Revenez dans quelques instants.
          </p>
        </Container>
      )}
    </div>
  );
}
