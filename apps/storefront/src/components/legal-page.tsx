import type { ShopInfo } from "@coupdecanon/config/shop-info";
import type { LegalDocumentView } from "../lib/legal.server";
import { Container } from "./container";
import { PageHero } from "./page-hero";
import { RichText } from "./rich-text";
import { SiteLink } from "./site-link";

/** "2026-10-01T12:00:00.000Z" → "1er octobre 2026", as French documents date themselves. */
export function formatLegalDate(date: string) {
  const day = new Date(date);
  const [first, ...rest] = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  })
    .format(day)
    .split(" ");
  return [first === "1" ? "1er" : first, ...rest].join(" ");
}

type Article = LegalDocumentView["articles"][number];

function Section({
  article,
  label,
  shop,
  siteUrl,
}: {
  article: Article;
  label: string;
  shop: ShopInfo;
  siteUrl: string;
}) {
  return (
    <section
      id={article.anchor}
      aria-labelledby={`${article.anchor}-titre`}
      className="flex scroll-mt-40 flex-col gap-4"
    >
      <h2 id={`${article.anchor}-titre`} className="text-2xl">
        {label}
      </h2>
      <RichText data={article.content} shop={shop} siteUrl={siteUrl} />
    </section>
  );
}

/**
 * A legal document's page, as the team writes it in Payload: its title and the date it took
 * effect, its summary, which stays in view on desktop, then its articles, numbered, and its
 * appendices. Its texts quote the shop's details from the settings.
 */
export function LegalDocumentPage({
  document,
  shop,
  siteUrl,
}: {
  document: LegalDocumentView;
  shop: ShopInfo;
  siteUrl: string;
}) {
  const entries = [
    ...document.articles.map((article, index) => ({
      article,
      label: `${index + 1}. ${article.title}`,
    })),
    ...document.appendices.map((article) => ({
      article,
      label: `Annexe : ${article.title}`,
    })),
  ];

  return (
    <div className="pb-section">
      <PageHero title={document.title}>
        En vigueur au {formatLegalDate(document.effectiveDate)}.
      </PageHero>
      <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <nav
          aria-label="Sommaire"
          className="flex flex-col gap-4 lg:sticky lg:top-40 lg:col-span-3"
        >
          <p className="text-sm font-medium">Sommaire</p>
          <ol className="flex flex-col gap-2 text-sm">
            {entries.map(({ article, label }) => (
              <li key={article.anchor}>
                <SiteLink
                  href={`#${article.anchor}`}
                  className="text-muted-foreground no-underline hover:text-foreground"
                >
                  {label}
                </SiteLink>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex max-w-text flex-col gap-block lg:col-span-7 lg:col-start-5">
          {document.preamble ? (
            <RichText data={document.preamble} shop={shop} siteUrl={siteUrl} />
          ) : null}
          {entries.map(({ article, label }) => (
            <Section
              key={article.anchor}
              article={article}
              label={label}
              shop={shop}
              siteUrl={siteUrl}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
