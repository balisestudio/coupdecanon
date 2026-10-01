import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "../../components/legal-page";
import { getLegalPage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { pageMeta, pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/legal-notice")({
  loader: () => getLegalPage({ data: "legal-notice" }),
  head: ({ loaderData }) =>
    loaderData
      ? pageMeta({
          siteUrl: loaderData.siteUrl,
          path: PATHS.legalNotice,
          title: pageTitle(loaderData.document.title),
          description: `${loaderData.document.title} de ${loaderData.shop.name}, la boutique du Domaine de Ouézy.`,
        })
      : {},
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
  component: Page,
});

function Page() {
  const { document, shop, siteUrl } = Route.useLoaderData();
  return <LegalDocumentPage document={document} shop={shop} siteUrl={siteUrl} />;
}
