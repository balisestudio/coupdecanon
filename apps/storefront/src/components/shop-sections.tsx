import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@coupdecanon/ui/components/empty";
import { cn } from "@coupdecanon/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Family, ProductSummary } from "../lib/catalog.server";
import { pluralizeProducts } from "../lib/format";
import { highlightsOf, type SectionLayout, type ShopSearch } from "../lib/shop";
import { Container } from "./container";
import { ProductTile } from "./product-tile";
import { SectionHeading } from "./section-heading";

/** A shop page's title, with its introduction on the right on desktop. */
export function ShopHero({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="boutique-titre">
      <Container className="flex flex-col gap-stack py-block lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-grid">
        <h1 id="boutique-titre" className="text-4xl lg:col-span-7">
          {title}
        </h1>
        <div className="flex flex-col gap-2 lg:col-span-4 lg:col-start-9">{children}</div>
      </Container>
    </section>
  );
}

function SectionProducts({
  layout,
  products,
  currencyCode,
}: {
  layout: SectionLayout;
  products: ProductSummary[];
  currencyCode: string;
}) {
  if (layout === "row") {
    return (
      <div className="grid grid-cols-2 items-start gap-x-grid gap-y-block lg:grid-cols-4">
        {products.map((product) => (
          <ProductTile
            key={product.handle}
            product={product}
            currencyCode={currencyCode}
            className="lg:even:mt-24"
          />
        ))}
      </div>
    );
  }

  if (layout === "list") {
    // Two columns on desktop, read down each column rather than across.
    const half = Math.ceil(products.length / 2);
    return (
      <div className="grid gap-y-8 lg:grid-cols-2 lg:gap-x-grid">
        {[products.slice(0, half), products.slice(half)].map((column) =>
          column.length ? (
            <div key={column[0]?.handle} className="flex flex-col gap-8">
              {column.map((product) => (
                <ProductTile
                  key={product.handle}
                  product={product}
                  currencyCode={currencyCode}
                  variant="compact"
                />
              ))}
            </div>
          ) : null,
        )}
      </div>
    );
  }

  // The first product in large, the next ones listed beside it; stacked on phones.
  const [feature, ...rest] = products;
  const atEnd = layout === "feature-end";
  return (
    <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
      {feature ? (
        <ProductTile
          product={feature}
          currencyCode={currencyCode}
          variant="feature"
          className={cn("lg:col-span-6", atEnd && "lg:col-start-7 lg:row-start-1")}
        />
      ) : null}
      {rest.length ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-x-grid gap-y-block lg:flex lg:flex-col lg:gap-8",
            atEnd ? "lg:col-span-5 lg:col-start-1 lg:row-start-1" : "lg:col-span-5 lg:col-start-8",
          )}
        >
          {rest.map((product) => (
            <ProductTile
              key={product.handle}
              product={product}
              currencyCode={currencyCode}
              variant="row"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A family on the shop's main page: its title, a few of its products and a link to the rest. */
export function FamilySection({
  family,
  layout,
  products,
  currencyCode,
  search,
}: {
  family: Family;
  layout: SectionLayout;
  products: ProductSummary[];
  currencyCode: string;
  search: ShopSearch;
}) {
  const titleId = `famille-${family.slug}`;

  return (
    <section aria-labelledby={titleId} className="pt-section">
      <Container className="flex flex-col gap-block">
        <SectionHeading
          action={
            <Link
              to="/cellar/$family"
              params={{ family: family.slug }}
              search={search}
              className="text-sm font-medium link-underline"
            >
              {family.productCount > 1
                ? `Voir les ${pluralizeProducts(family.productCount)}`
                : "Voir le produit"}
            </Link>
          }
        >
          <h2 id={titleId} className="text-3xl">
            {family.name}
          </h2>
        </SectionHeading>
        <SectionProducts layout={layout} products={products} currencyCode={currencyCode} />
      </Container>
    </section>
  );
}

/** A word from the estate, between the families, as the team writes it in Payload. */
export function ShopQuote({ text, caption }: { text: string; caption?: string | null }) {
  return (
    <section aria-label="Un mot du domaine" className="mt-section bg-card">
      <Container className="flex justify-center py-section">
        <figure className="flex max-w-dialog flex-col items-center gap-6 text-center">
          <blockquote className="font-serif text-3xl font-medium italic">{text}</blockquote>
          {caption ? (
            <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
          ) : null}
        </figure>
      </Container>
    </section>
  );
}

/**
 * A family's products on 4 columns, 2 on phones. From five products on, some take a double
 * cell: one every nine on desktop, alternating left and right, one every seven on phones.
 */
export function FamilyGrid({
  products,
  currencyCode,
}: {
  products: ProductSummary[];
  currencyCode: string;
}) {
  const highlights = highlightsOf(products.length);

  return (
    <Container className="pt-block">
      <div className="grid grid-flow-row-dense grid-cols-2 gap-x-grid gap-y-block lg:grid-cols-4">
        {products.map((product, index) => {
          const highlight = highlights[index];
          return (
            <ProductTile
              key={product.handle}
              product={product}
              currencyCode={currencyCode}
              heading="h2"
              className={cn(
                highlight?.mobile && "max-lg:col-span-2",
                highlight?.desktop && "lg:col-span-2 lg:row-span-2",
                highlight?.desktop === "start" && "lg:col-start-1",
                highlight?.desktop === "end" && "lg:col-start-3",
              )}
              // A double cell's photo fills the height its two rows leave its text, without
              // stretching them: it starts from nothing (basis-0) rather than its own height.
              pictureClassName={cn(
                highlight?.desktop && "lg:aspect-auto lg:min-h-0 lg:basis-0 lg:grow",
              )}
              bodyClassName={cn(highlight?.desktop && "lg:grow-0")}
              titleClassName={cn(
                highlight?.mobile && "max-lg:text-2xl",
                highlight?.desktop && "lg:text-2xl",
              )}
            />
          );
        })}
      </div>
    </Container>
  );
}

/** When the filter keeps nothing. */
export function EmptyShop({ search }: { search: ShopSearch }) {
  return (
    <Container className="pt-section">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Aucun produit ne correspond à ce filtre.</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Link
            to="."
            search={{ ...search, "alcohol-free": undefined }}
            className="text-sm font-medium link-underline"
          >
            Voir tous les produits
          </Link>
        </EmptyContent>
      </Empty>
    </Container>
  );
}
