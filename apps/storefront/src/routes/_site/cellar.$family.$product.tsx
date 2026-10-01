import { phoneToE164, type ShopContact } from "@coupdecanon/config/shop-info";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@coupdecanon/ui/components/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@coupdecanon/ui/components/breadcrumb";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { Photo } from "../../components/photo";
import { ProductCard } from "../../components/product-card";
import { ProductPicture } from "../../components/product-picture";
import { ProductPurchase } from "../../components/product-purchase";
import { SectionHeading } from "../../components/section-heading";
import { SiteLink } from "../../components/site-link";
import { Steps } from "../../components/steps";
import type { ProductSummary } from "../../lib/catalog.server";
import { linkOf } from "../../lib/content";
import { PATHS } from "../../lib/paths";
import { getProductPage, type ProductDetail } from "../../lib/product-page";
import { breadcrumbJsonLd, pageMeta, pageTitle, productJsonLd } from "../../lib/seo";
import type { ProductPage as PageContent } from "../../payload-types";

export const Route = createFileRoute("/_site/cellar/$family/$product")({
  loader: ({ params }) =>
    getProductPage({ data: { family: params.family, handle: params.product } }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, product, currencyCode } = loaderData;
    const path = product.path;
    const { meta, links } = pageMeta({
      siteUrl,
      path,
      title: pageTitle(product.title),
      description:
        product.description ??
        product.subtitle ??
        `${product.title}, fait au Domaine de Ouézy avec les fruits de nos vergers.`,
      image: product.images[0] ?? null,
      type: "product",
    });
    return {
      meta,
      links,
      scripts: [
        breadcrumbJsonLd(siteUrl, [
          { name: "Accueil", path: PATHS.home },
          { name: "La boutique", path: PATHS.shop },
          { name: product.parentFamily.name, path: PATHS.family(product.parentFamily.slug) },
          { name: product.title, path },
        ]),
        productJsonLd(siteUrl, product, currencyCode),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product, related, currencyCode, contact, content } = Route.useLoaderData();

  return (
    <div className="pb-section">
      <ProductTrail product={product} />
      <section aria-labelledby="produit-titre">
        <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
          <ProductPhotos product={product} />
          {/* The purchase stays in view while the photos scroll by. */}
          <div className="flex flex-col gap-stack lg:sticky lg:top-32 lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-3">
              <h1 id="produit-titre" className="text-4xl">
                {product.title}
              </h1>
              {product.subtitle ? (
                <p className="text-sm text-muted-foreground">{product.subtitle}</p>
              ) : null}
              {product.domainOnly ? (
                <p className="text-sm font-medium">Uniquement au domaine</p>
              ) : null}
            </div>
            {product.description ? <p className="text-lg">{product.description}</p> : null}
            <ProductPurchase product={product} currencyCode={currencyCode} />
            <ProductDetails
              making={product.making}
              makingTitle={content.story.makingTitle}
              items={content.details?.items ?? []}
            />
          </div>
        </Container>
      </section>
      {product.steps.length ? (
        <Steps id="etapes-titre" title={content.story.stepsTitle} steps={product.steps} />
      ) : null}
      <Tasting content={content.tasting} contact={contact} />
      {related.length ? (
        <Related title={content.related.title} products={related} currencyCode={currencyCode} />
      ) : null}
    </div>
  );
}

function ProductTrail({ product }: { product: ProductDetail }) {
  return (
    <Container className="py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/cellar">Boutique</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/cellar/$family" params={{ family: product.parentFamily.slug }}>
                {product.parentFamily.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
}

/** The first photo in a hand-cut arch, the others two by two beneath it, however many. */
function ProductPhotos({ product }: { product: ProductDetail }) {
  const [first, ...others] = product.images;

  return (
    <div className="flex flex-col gap-grid lg:col-span-7">
      <Arch name={product.handle} className="aspect-portrait">
        {first ? (
          <Photo src={first} alt={product.title} priority className="size-full" />
        ) : (
          <ProductPicture product={product} className="size-full" />
        )}
      </Arch>
      {others.length ? (
        <div className="grid grid-cols-2 gap-grid">
          {others.map((src, index) => (
            <Photo
              key={src}
              src={src}
              alt={`${product.title}, photo ${index + 2}`}
              className="aspect-portrait"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** How the product is made, when the team has written it, then what applies to every product. */
function ProductDetails({
  making,
  makingTitle,
  items,
}: {
  making: string | null;
  makingTitle: string;
  items: NonNullable<NonNullable<PageContent["details"]>["items"]>;
}) {
  return (
    <section aria-labelledby="details-titre">
      <h2 id="details-titre" className="sr-only">
        Informations
      </h2>
      <Accordion type="multiple" defaultValue={making ? ["making"] : []} className="border-t">
        {making ? (
          <AccordionItem value="making">
            <AccordionTrigger>{makingTitle}</AccordionTrigger>
            <AccordionContent>{making}</AccordionContent>
          </AccordionItem>
        ) : null}
        {items.map((item) => {
          const link = linkOf(item.link);
          return (
            <AccordionItem key={item.id} value={item.id ?? item.title}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                <p>{item.text}</p>
                {link ? (
                  <SiteLink href={link.url} className="self-start font-medium link-underline">
                    {link.label}
                  </SiteLink>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

/** An invitation to taste at the estate's shop, with its address and phone number. */
function Tasting({
  content,
  contact,
}: {
  content: PageContent["tasting"];
  contact: ShopContact | null;
}) {
  return (
    <section aria-labelledby="degustation-titre" className="mt-section bg-card">
      <Container className="flex flex-col gap-stack py-section lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
        <Photo
          media={content.photo}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="aspect-landscape lg:col-span-7"
        />
        <div className="flex flex-col gap-stack lg:col-span-4 lg:col-start-9">
          <h2 id="degustation-titre" className="text-3xl">
            {content.title}
          </h2>
          {content.text ? <p>{content.text}</p> : null}
          {contact ? (
            <p className="text-sm text-muted-foreground">
              {contact.address.place ?? contact.address.street}, {contact.address.postal_code}{" "}
              {contact.address.city}. Téléphone :{" "}
              <a href={`tel:${phoneToE164(contact.phone)}`} className="link-underline">
                {contact.phone}
              </a>
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

/** A few other products of the same family, every other one set lower on desktop. */
function Related({
  title,
  products,
  currencyCode,
}: {
  title: string;
  products: ProductSummary[];
  currencyCode: string;
}) {
  return (
    <section aria-labelledby="famille-titre" className="pt-section">
      <Container className="flex flex-col gap-block">
        <SectionHeading
          action={
            <Link to="/cellar" className="text-sm font-medium link-underline">
              Toute la boutique
            </Link>
          }
        >
          <h2 id="famille-titre" className="text-3xl">
            {title}
          </h2>
        </SectionHeading>
        <div className="grid grid-cols-2 items-start gap-x-grid gap-y-block lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.handle}
              product={product}
              currencyCode={currencyCode}
              className="max-lg:odd:last:col-span-2 lg:even:mt-24"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
