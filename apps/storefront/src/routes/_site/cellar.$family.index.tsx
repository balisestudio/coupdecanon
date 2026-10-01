import { createFileRoute } from "@tanstack/react-router";
import { Container } from "../../components/container";
import { ShopFilters } from "../../components/shop-filters";
import { EmptyShop, FamilyGrid, ShopHero } from "../../components/shop-sections";
import { PATHS } from "../../lib/paths";
import { breadcrumbJsonLd, pageMeta, pageTitle, productListJsonLd } from "../../lib/seo";
import { isFiltered, shopSearch } from "../../lib/shop";
import { getFamilyPage } from "../../lib/shop-page";

export const Route = createFileRoute("/_site/cellar/$family/")({
  validateSearch: shopSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => getFamilyPage({ data: { ...deps, slug: params.family } }),
  head: ({ loaderData, match }) => {
    if (!loaderData?.shop) return {};
    const { siteUrl, shop, introduction } = loaderData;
    const { family } = shop;
    const path = PATHS.family(family.slug);
    const { meta, links } = pageMeta({
      siteUrl,
      path,
      title: pageTitle(`${family.name}, la boutique du domaine`),
      description:
        introduction ??
        `${family.name} du Domaine de Ouézy, faits en bio avec les fruits de nos vergers.`,
      noindex: isFiltered(match.search),
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: "La boutique", path: PATHS.shop },
          { name: family.name, path },
        ]),
        productListJsonLd(siteUrl, family.name, shop.products, shop.currencyCode),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  }),
  component: FamilyPage,
});

function FamilyPage() {
  const { shop, introduction } = Route.useLoaderData();
  const search = Route.useSearch();

  if (!shop) {
    return (
      <Container className="py-section">
        <p className="text-lg text-muted-foreground">
          La boutique est momentanément indisponible. Revenez dans quelques instants.
        </p>
      </Container>
    );
  }

  const { family, products } = shop;
  return (
    <div className="pb-section">
      <ShopHero title={family.name}>
        {introduction ? <p className="text-lg">{introduction}</p> : null}
      </ShopHero>
      <ShopFilters
        families={shop.families}
        selectedCount={shop.selectedCount}
        activeFamily={family.slug}
        search={search}
      />
      {products.length ? (
        <FamilyGrid products={products} currencyCode={shop.currencyCode} />
      ) : (
        <EmptyShop search={search} />
      )}
    </div>
  );
}
