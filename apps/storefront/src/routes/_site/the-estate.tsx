import { createFileRoute } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { CenteredHero } from "../../components/page-hero";
import { Photo } from "../../components/photo";
import { SiteLink } from "../../components/site-link";
import { Visit } from "../../components/visit";
import { linkOf } from "../../lib/content";
import { getEstatePage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { breadcrumbJsonLd, pageMeta, pageTitle } from "../../lib/seo";
import type { Estate as EstateContent } from "../../payload-types";

export const Route = createFileRoute("/_site/the-estate")({
  loader: () => getEstatePage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: PATHS.estate,
      title: pageTitle(content.seo.title),
      description: content.seo.description,
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: content.hero.title, path: PATHS.estate },
        ]),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
  component: Estate,
});

function Estate() {
  const { shop, content, visit, awards } = Route.useLoaderData();

  return (
    <>
      <section aria-labelledby="domaine-titre" className="flex flex-col gap-block">
        <CenteredHero title={content.hero.title}>{content.hero.text}</CenteredHero>
        <Photo media={content.hero.photo} priority className="aspect-landscape lg:aspect-wide" />
      </section>
      <Family content={content.family} />
      <section aria-label="Le domaine en chiffres" className="bg-card">
        <Container className="flex justify-center py-section">
          <p className="max-w-dialog text-center font-serif text-3xl font-medium">
            {content.figures.text}
          </p>
        </Container>
      </section>
      <MadeHere content={content.madeHere} />
      {awards.length ? <Awards title={content.awards.title} awards={awards} /> : null}
      <Activities content={content.activities} />
      <div className="pb-section">
        <Visit content={visit} contact={shop.contact} hours={shop.hours} />
      </div>
    </>
  );
}

function Family({ content }: { content: EstateContent["family"] }) {
  const link = linkOf(content.link);
  return (
    <section aria-labelledby="famille-titre">
      <Container className="flex flex-col gap-block py-section lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
        <Arch name="famille" className="aspect-portrait lg:col-span-5">
          <Photo
            media={content.photo}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="size-full"
          />
        </Arch>
        <div className="flex max-w-text flex-col gap-stack lg:col-span-6 lg:col-start-7">
          <h2 id="famille-titre" className="text-3xl">
            {content.title}
          </h2>
          {(content.paragraphs ?? []).map((paragraph) => (
            <p key={paragraph.id}>{paragraph.text}</p>
          ))}
          {link ? (
            <SiteLink href={link.url} className="self-start text-sm font-medium link-underline">
              {link.label}
            </SiteLink>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/** The first workshop in large, the others beside it, set lower, however many. */
function MadeHere({ content }: { content: EstateContent["madeHere"] }) {
  const [first, ...others] = content.workshops ?? [];

  return (
    <section aria-labelledby="sur-place-titre">
      <Container className="flex flex-col gap-block pt-section">
        <div className="flex flex-col gap-stack lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid">
          <h2 id="sur-place-titre" className="text-3xl lg:col-span-6">
            {content.title}
          </h2>
          {content.text ? (
            <p className="text-muted-foreground lg:col-span-4 lg:col-start-9">{content.text}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
          {first ? (
            <article className="flex flex-col gap-4 lg:col-span-7">
              <Photo
                media={first.photo}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="aspect-landscape"
              />
              <h3 className="text-2xl">{first.title}</h3>
              <p className="max-w-text text-muted-foreground">{first.text}</p>
            </article>
          ) : null}
          {others.length ? (
            <div className="flex flex-col gap-block lg:col-span-4 lg:col-start-9 lg:pt-24">
              {others.map((workshop) => (
                <article key={workshop.id} className="flex flex-col gap-4">
                  <Photo
                    media={workshop.photo}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="aspect-landscape"
                  />
                  <h3 className="text-2xl">{workshop.title}</h3>
                  <p className="text-muted-foreground">{workshop.text}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function Awards({
  title,
  awards,
}: {
  title: string;
  awards: { id: number; year: number; title: string; detail: string }[];
}) {
  return (
    <section id="awards" aria-labelledby="recompenses-titre" className="scroll-mt-40">
      <Container className="flex flex-col gap-block py-section lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <h2 id="recompenses-titre" className="text-3xl lg:col-span-4">
          {title}
        </h2>
        <ul className="border-t lg:col-span-7 lg:col-start-6">
          {awards.map((award) => (
            <li
              key={award.id}
              className="flex flex-col gap-2 border-b py-8 lg:grid lg:grid-cols-7 lg:items-baseline lg:gap-x-grid"
            >
              <span className="font-serif text-3xl font-medium lg:col-span-2">{award.year}</span>
              <span className="flex flex-col gap-1 lg:col-span-5">
                <span className="font-serif text-xl font-medium">{award.title}</span>
                <span className="text-muted-foreground">{award.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** The estate's other activities, each linking to its own website, on the forest green. */
function Activities({ content }: { content: EstateContent["activities"] }) {
  const items = content.items ?? [];
  if (!items.length) return null;

  return (
    <section aria-labelledby="aussi-titre" className="dark bg-background text-foreground">
      <Container className="flex flex-col gap-block py-section">
        <div className="flex flex-col gap-stack lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid">
          <h2 id="aussi-titre" className="text-3xl lg:col-span-6">
            {content.title}
          </h2>
          {content.text ? (
            <p className="text-muted-foreground lg:col-span-4 lg:col-start-9">{content.text}</p>
          ) : null}
        </div>
        <ul className="border-t">
          {items.map((activity) => (
            <li key={activity.id}>
              <SiteLink
                href={activity.link.url}
                className="group flex flex-col gap-2 border-b py-8 text-foreground no-underline lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-grid"
              >
                <span className="font-serif text-2xl font-medium lg:col-span-4">
                  {activity.name}
                </span>
                <span className="text-muted-foreground lg:col-span-6">{activity.text}</span>
                <span className="self-start text-sm font-medium link-underline lg:col-span-2 lg:justify-self-end">
                  {activity.link.label}
                </span>
              </SiteLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
