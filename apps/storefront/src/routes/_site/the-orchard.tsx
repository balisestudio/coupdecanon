import { Button } from "@coupdecanon/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { CenteredHero } from "../../components/page-hero";
import { Photo } from "../../components/photo";
import { SiteLink } from "../../components/site-link";
import { Steps } from "../../components/steps";
import { VarietyList } from "../../components/variety-list";
import { linkOf } from "../../lib/content";
import { getOrchardPage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { breadcrumbJsonLd, pageMeta, pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/the-orchard")({
  loader: () => getOrchardPage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: PATHS.orchard,
      title: pageTitle(content.seo.title),
      description: content.seo.description,
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: content.hero.title, path: PATHS.orchard },
        ]),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
  component: Orchard,
});

function Orchard() {
  const { content } = Route.useLoaderData();
  const { hero, apples, pears, harvest, additives, animals, taste } = content;
  const pearsLink = linkOf(pears.link);
  const animalsLink = linkOf(animals.link);
  const tasteCta = linkOf(taste.cta);
  const varieties = (apples.varieties ?? []).map((variety) => variety.name);
  const steps = harvest.steps ?? [];

  return (
    <>
      <section aria-labelledby="verger-titre" className="flex flex-col gap-block">
        <CenteredHero title={hero.title}>{hero.text}</CenteredHero>
        <Container className="lg:grid lg:grid-cols-12 lg:gap-x-grid">
          <Arch name="verger-en-fleurs" className="aspect-portrait lg:col-span-8 lg:col-start-3">
            <Photo
              media={hero.photo}
              sizes="(min-width: 1024px) 67vw, 100vw"
              priority
              className="size-full"
            />
          </Arch>
        </Container>
      </section>

      {/* The title and its words on one line, the varieties across the page beneath. */}
      <section aria-labelledby="pommes-titre">
        <Container className="flex flex-col gap-stack py-section lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid lg:gap-y-block">
          <h2 id="pommes-titre" className="text-3xl lg:col-span-6">
            {apples.title}
          </h2>
          {apples.text ? <p className="lg:col-span-4 lg:col-start-9">{apples.text}</p> : null}
          {varieties.length ? (
            <VarietyList
              varieties={varieties}
              columns={3}
              size="text-2xl"
              className="max-lg:mt-block lg:col-span-12"
            />
          ) : null}
        </Container>
      </section>

      <section aria-labelledby="poires-titre" className="bg-card">
        <Container className="flex flex-col gap-block py-section lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
          <div className="flex flex-col gap-stack lg:col-span-5">
            <h2 id="poires-titre" className="text-3xl">
              {pears.title}
            </h2>
            {(pears.paragraphs ?? []).map((paragraph) => (
              <p key={paragraph.id}>{paragraph.text}</p>
            ))}
            {pearsLink ? (
              <SiteLink
                href={pearsLink.url}
                className="self-start text-sm font-medium link-underline"
              >
                {pearsLink.label}
              </SiteLink>
            ) : null}
          </div>
          <Photo
            media={pears.photo}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-landscape lg:col-span-6 lg:col-start-7"
          />
        </Container>
      </section>

      {steps.length ? <Steps id="recolte-titre" title={harvest.title} steps={steps} /> : null}

      <section
        aria-labelledby="sans-ajout-titre"
        className="dark mt-section bg-background text-foreground"
      >
        <Container className="flex flex-col items-center gap-stack py-section text-center">
          <h2 id="sans-ajout-titre" className="max-w-dialog text-3xl">
            {additives.title}
          </h2>
          {additives.text ? (
            <p className="max-w-text text-muted-foreground">{additives.text}</p>
          ) : null}
        </Container>
      </section>

      <section aria-labelledby="animaux-titre">
        <Container className="flex flex-col gap-block py-section lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
          <Photo
            media={animals.photo}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-landscape lg:col-span-6"
          />
          <div className="flex flex-col gap-stack lg:col-span-5 lg:col-start-8">
            <h2 id="animaux-titre" className="text-3xl">
              {animals.title}
            </h2>
            {(animals.paragraphs ?? []).map((paragraph) => (
              <p key={paragraph.id}>{paragraph.text}</p>
            ))}
            {animalsLink ? (
              <SiteLink
                href={animalsLink.url}
                className="self-start text-sm font-medium link-underline"
              >
                {animalsLink.label}
              </SiteLink>
            ) : null}
          </div>
        </Container>
      </section>

      <section aria-labelledby="gouter-titre">
        <Container className="flex flex-col items-center gap-stack pb-section text-center">
          <h2 id="gouter-titre" className="text-3xl">
            {taste.title}
          </h2>
          {tasteCta ? (
            <Button asChild>
              <SiteLink href={tasteCta.url}>{tasteCta.label}</SiteLink>
            </Button>
          ) : null}
        </Container>
      </section>
    </>
  );
}
