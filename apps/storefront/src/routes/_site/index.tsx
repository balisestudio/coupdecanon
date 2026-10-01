import { Button } from "@coupdecanon/ui/components/button";
import { cn } from "@coupdecanon/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { Photo } from "../../components/photo";
import { ProductCard } from "../../components/product-card";
import { SectionHeading } from "../../components/section-heading";
import { SiteLink } from "../../components/site-link";
import { VarietyList } from "../../components/variety-list";
import { Visit } from "../../components/visit";
import { BOTTLE_VIEW_BOX, bottlePath } from "../../lib/bottle-shape";
import type { Family, HomeCatalog } from "../../lib/catalog.server";
import { lines, linkOf } from "../../lib/content";
import { seedFrom } from "../../lib/cutout-shape";
import type { FamilyContent } from "../../lib/families.server";
import { pluralizeProducts } from "../../lib/format";
import { getHomePage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { pageMeta, pageTitle, productListJsonLd, storeJsonLd, websiteJsonLd } from "../../lib/seo";
import type { Home as HomeContent } from "../../payload-types";

export const Route = createFileRoute("/_site/")({
  loader: () => getHomePage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, catalog, shop, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: "/",
      title: pageTitle(content.seo.title),
      description: content.seo.description,
    });
    return {
      meta,
      links,
      scripts: [
        storeJsonLd(siteUrl, shop),
        websiteJsonLd(siteUrl),
        ...(catalog?.featured.length
          ? [
              productListJsonLd(
                siteUrl,
                content.cellar.title,
                catalog.featured,
                catalog.currencyCode,
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
  component: Home,
});

function Home() {
  const { catalog, shop, content, varieties, visit, awards, families } = Route.useLoaderData();

  return (
    <>
      <Hero content={content.hero} />
      {catalog?.featured.length ? <Cellar catalog={catalog} title={content.cellar.title} /> : null}
      <Estate content={content} varieties={varieties} />
      <Families
        title={content.families.title}
        families={catalog?.families ?? []}
        content={families}
      />
      <Miniatures content={content.miniatures} />
      <Visit content={visit} contact={shop.contact} hours={shop.hours} prominent />
      {awards.length ? <Awards title={content.awards.title} awards={awards} /> : null}
    </>
  );
}

function Hero({ content }: { content: HomeContent["hero"] }) {
  const cta = linkOf(content.cta);
  return (
    <section aria-labelledby="accueil-titre">
      <Container className="flex flex-col items-center pt-block">
        <h1 id="accueil-titre" className="text-center text-5xl">
          {content.title}
        </h1>
        {content.text ? (
          <p className="mt-stack max-w-text text-center text-lg">{content.text}</p>
        ) : null}
        {cta ? (
          <Button asChild className="mt-stack">
            <SiteLink href={cta.url}>{cta.label}</SiteLink>
          </Button>
        ) : null}
        <div className="mt-block grid w-full grid-cols-2 items-start gap-grid lg:grid-cols-12">
          <Photo
            media={content.photoStart}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="aspect-portrait lg:col-span-3 lg:mt-72"
          />
          <Arch
            name="orchard"
            className="col-span-2 row-start-1 aspect-portrait md:aspect-landscape lg:col-span-6 lg:col-start-4 lg:aspect-portrait"
          >
            <Photo
              media={content.photo}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="size-full"
            />
          </Arch>
          <Photo
            media={content.photoEnd}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="mt-10 aspect-portrait lg:col-span-3 lg:mt-24"
          />
        </div>
      </Container>
    </section>
  );
}

/**
 * The admin team's favorites, however many: the first three in the mockup's staggered
 * composition, one large and two set lower, the others following on four columns.
 */
function Cellar({ catalog, title }: { catalog: HomeCatalog; title: string }) {
  const [first, second, third, ...more] = catalog.featured;

  return (
    <section aria-labelledby="cave-titre">
      <Container className="flex flex-col gap-block pt-section">
        <SectionHeading
          action={
            <SiteLink href={PATHS.shop} className="text-sm font-medium link-underline">
              Voir les {pluralizeProducts(catalog.productCount)}
            </SiteLink>
          }
        >
          <h2 id="cave-titre" className="text-4xl">
            {title}
          </h2>
        </SectionHeading>
        <div className="grid grid-cols-2 items-start gap-x-grid gap-y-block lg:grid-cols-12">
          {first ? (
            <ProductCard
              product={first}
              currencyCode={catalog.currencyCode}
              size="large"
              className="col-span-2 lg:col-span-5"
            />
          ) : null}
          {second ? (
            <ProductCard
              product={second}
              currencyCode={catalog.currencyCode}
              className="lg:col-span-3 lg:col-start-7 lg:mt-40"
            />
          ) : null}
          {third ? (
            <ProductCard
              product={third}
              currencyCode={catalog.currencyCode}
              className="mt-12 lg:col-span-3 lg:col-start-10 lg:mt-80"
            />
          ) : null}
        </div>
        {more.length ? (
          <div className="grid grid-cols-2 items-start gap-x-grid gap-y-block lg:grid-cols-4">
            {more.map((product) => (
              <ProductCard
                key={product.handle}
                product={product}
                currencyCode={catalog.currencyCode}
                className="lg:even:mt-24"
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/** "Le fruit fait le travail" and the orchard's varieties, on the estate's forest green. */
function Estate({ content, varieties }: { content: HomeContent; varieties: string[] }) {
  const { estate, orchard } = content;
  const orchardLink = linkOf(orchard.link);
  return (
    <section
      id="estate"
      aria-labelledby="domaine-titre"
      className="dark mt-section bg-background text-foreground"
    >
      <Container className="flex flex-col gap-section py-section">
        <div className="flex flex-col gap-stack lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
          <Arch
            name="cellar"
            className="aspect-portrait md:aspect-landscape lg:col-span-5 lg:aspect-portrait"
          >
            <Photo
              media={estate.photo}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="size-full"
            />
          </Arch>
          <div className="flex flex-col gap-stack lg:col-span-6 lg:col-start-7">
            <h2 id="domaine-titre" className="text-4xl">
              {lines(estate.title).map((line, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: a title's lines never move
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h2>
            {(estate.paragraphs ?? []).map((paragraph) => (
              <p key={paragraph.id} className="max-w-text text-muted-foreground">
                {paragraph.text}
              </p>
            ))}
          </div>
        </div>
        <div
          id="orchard"
          className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid"
        >
          <div className="flex flex-col gap-stack lg:col-span-5">
            <h2 id="verger-titre" className="text-3xl">
              {orchard.title}
            </h2>
            {orchard.text ? <p className="text-muted-foreground">{orchard.text}</p> : null}
            {orchardLink ? (
              <SiteLink
                href={orchardLink.url}
                className="self-start text-sm font-medium link-underline"
              >
                {orchardLink.label}
              </SiteLink>
            ) : null}
          </div>
          <VarietyList varieties={varieties} className="lg:col-span-6 lg:col-start-7" />
        </div>
      </Container>
    </section>
  );
}

/** Beyond this many families, the home page's family cards wrap onto several rows. */
const FAMILIES_PER_ROW = 5;

/** One card per product family, from Medusa, with its photo from Payload, side by side. */
function Families({
  title,
  families,
  content,
}: {
  title: string;
  families: Family[];
  content: Record<string, FamilyContent>;
}) {
  return (
    <section aria-labelledby="familles-titre">
      <Container className="flex flex-col gap-block py-section">
        <h2 id="familles-titre" className="text-4xl lg:w-2/3">
          {title}
        </h2>
        {families.length ? (
          <nav aria-label="Familles de produits">
            <ul
              className={cn(
                "grid grid-cols-2 gap-x-grid gap-y-block md:grid-cols-3",
                // Up to five families share one row on desktop; more wrap on four columns.
                families.length <= FAMILIES_PER_ROW
                  ? "lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr"
                  : "lg:grid-cols-4",
              )}
            >
              {families.map((family) => (
                <li key={family.name}>
                  <SiteLink
                    href={PATHS.family(family.slug)}
                    className="group flex flex-col text-foreground no-underline"
                  >
                    {/* The arch stays put while the photo inside it zooms, as on product cards. */}
                    <Arch name={family.name} className="aspect-portrait">
                      <Photo
                        media={content[family.id]?.photo}
                        alt=""
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                        className="size-full transition-transform duration-500 group-hover:scale-102"
                      />
                    </Arch>
                    <span className="flex flex-col gap-1 pt-4">
                      <span className="font-serif text-xl font-medium">{family.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {pluralizeProducts(family.productCount)}
                      </span>
                    </span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </section>
  );
}

/** Twelve cut-out calvados bottles, each seeded by its place in the row. */
const MINIATURE_BOTTLES = Array.from({ length: 12 }, (_, index) =>
  bottlePath({ kind: "calvados", seed: seedFrom(`miniature-${index}`) }),
);

/** Miniatures of calvados for weddings: a title, a row of bottles and the offer in figures. */
function Miniatures({ content }: { content: HomeContent["miniatures"] }) {
  const rule = "border-t pt-6";
  const cta = linkOf(content.cta);

  return (
    <section aria-labelledby="mignonnettes-titre" className="bg-card">
      <Container className="flex flex-col gap-block py-section">
        <div className="flex flex-col gap-stack lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid">
          <h2 id="mignonnettes-titre" className="text-4xl lg:col-span-8">
            {content.title}
          </h2>
          {content.text ? <p className="lg:col-span-4 lg:col-start-9">{content.text}</p> : null}
        </div>
        <ul aria-hidden="true" className="grid grid-cols-6 items-end gap-x-grid md:grid-cols-12">
          {MINIATURE_BOTTLES.map((d, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the row's slots never move
            <li key={index} className={index >= 6 ? "max-md:hidden" : undefined}>
              <svg
                viewBox={BOTTLE_VIEW_BOX}
                aria-hidden="true"
                className="mx-auto h-auto w-full max-w-16 fill-primary"
              >
                <path d={d} />
              </svg>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-x-grid gap-y-8 lg:grid-cols-4">
          {(content.facts ?? []).map((fact) => (
            <div key={fact.id} className={`flex flex-col gap-2 ${rule}`}>
              <span className="font-serif text-3xl font-medium">{fact.value}</span>
              <span className="text-sm text-muted-foreground">{fact.label}</span>
            </div>
          ))}
          {cta ? (
            <div className={`max-lg:col-span-2 ${rule}`}>
              <Button asChild size="lg" className="w-full">
                <SiteLink href={cta.url}>{cta.label}</SiteLink>
              </Button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/** The estate's awards, in a row under a ruled title. */
function Awards({
  title,
  awards,
}: {
  title: string;
  awards: { id: number; year: number; summary: string }[];
}) {
  const rule = "border-t pt-6";

  return (
    <section aria-labelledby="recompenses" className="pt-block pb-section">
      <Container className="flex flex-col gap-8 lg:grid lg:grid-cols-4 lg:items-start lg:gap-x-grid">
        <div className={rule}>
          <h2 id="recompenses" className="text-2xl">
            {title}
          </h2>
        </div>
        {awards.map((award) => (
          <div key={award.id} className={`flex flex-col gap-3 ${rule}`}>
            <span className="font-serif text-3xl font-medium">{award.year}</span>
            <span className="text-sm">{award.summary}</span>
          </div>
        ))}
      </Container>
    </section>
  );
}
