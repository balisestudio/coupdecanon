import { phoneToE164 } from "@coupdecanon/config/shop-info";
import { Button } from "@coupdecanon/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { Photo } from "../../components/photo";
import { QuoteForm } from "../../components/quote-form";
import { SiteLink } from "../../components/site-link";
import { fillIn, linkOf } from "../../lib/content";
import { getWeddingsPage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { breadcrumbJsonLd, pageMeta, pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/weddings")({
  loader: () => getWeddingsPage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: PATHS.weddings,
      title: pageTitle(content.seo.title),
      description: content.seo.description,
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: content.hero.title, path: PATHS.weddings },
        ]),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
  component: Weddings,
});

function Weddings() {
  const { shop, content, price } = Route.useLoaderData();
  const { contact } = shop;
  const { hero, offer, quote } = content;
  const venueLink = linkOf(offer.venue.link);

  return (
    <>
      <section aria-labelledby="mariages-titre">
        <Container className="flex flex-col gap-block pt-block lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid">
          <div className="flex flex-col gap-stack lg:col-span-5 lg:pb-8">
            <h1 id="mariages-titre" className="text-4xl">
              {hero.title}
            </h1>
            {hero.text ? <p className="text-lg">{hero.text}</p> : null}
            <Button asChild className="self-start">
              <a href="#quote">{hero.ctaLabel}</a>
            </Button>
          </div>
          <Arch name="mariages" className="aspect-portrait lg:col-span-6 lg:col-start-7">
            <Photo
              media={hero.photo}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="size-full"
            />
          </Arch>
        </Container>
      </section>

      <section aria-labelledby="offre-titre">
        <Container className="flex flex-col gap-block py-section">
          <h2 id="offre-titre" className="text-3xl">
            {offer.title}
          </h2>
          <div className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
            <article className="flex flex-col gap-4 lg:col-span-6">
              <Photo
                media={offer.miniatures.photo}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-landscape"
              />
              <h3 className="text-2xl">{offer.miniatures.title}</h3>
              {offer.miniatures.text ? (
                <p className="max-w-text text-muted-foreground">
                  {fillIn(offer.miniatures.text, { prix: price })}
                </p>
              ) : null}
            </article>
            <article className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8 lg:mt-40">
              <Photo
                media={offer.drinks.photo}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="aspect-landscape"
              />
              <h3 className="text-2xl">{offer.drinks.title}</h3>
              {offer.drinks.text ? (
                <p className="text-muted-foreground">{offer.drinks.text}</p>
              ) : null}
            </article>
          </div>
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:items-baseline-last lg:gap-x-grid">
            <h3 className="text-2xl lg:col-span-4">{offer.venue.title}</h3>
            {offer.venue.text ? (
              <p className="text-muted-foreground lg:col-span-6">{offer.venue.text}</p>
            ) : null}
            {venueLink ? (
              <SiteLink
                href={venueLink.url}
                className="self-start text-sm font-medium link-underline lg:col-span-2 lg:justify-self-end"
              >
                {venueLink.label}
              </SiteLink>
            ) : null}
          </div>
        </Container>
      </section>

      <section id="quote" aria-labelledby="devis-titre" className="scroll-mt-40 bg-card">
        <Container className="flex flex-col gap-block py-section lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
          <div className="flex flex-col gap-stack lg:col-span-4">
            <h2 id="devis-titre" className="text-3xl">
              {quote.title}
            </h2>
            {quote.text ? <p>{quote.text}</p> : null}
            {contact ? (
              <p className="text-sm text-muted-foreground">
                Vous préférez en parler ? Appelez-nous au{" "}
                <a href={`tel:${phoneToE164(contact.phone)}`} className="link-underline">
                  {contact.phone}
                </a>
                .
              </p>
            ) : null}
          </div>
          <QuoteForm />
        </Container>
      </section>
    </>
  );
}
