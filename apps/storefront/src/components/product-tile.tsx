import { cn } from "@coupdecanon/ui/lib/utils";
import type { ProductSummary } from "../lib/catalog.server";
import { formatFromPrice } from "../lib/format";
import { CartAction } from "./cart-action";
import { Price } from "./price";
import { ProductPicture } from "./product-picture";
import { SiteLink } from "./site-link";

/**
 * - `feature`: large, its name beside its price and button on desktop;
 * - `card`: a portrait card;
 * - `row`: a card on phones, a row with the picture on its left on desktop;
 * - `compact`: a small picture beside the text, the price and button on the right on desktop.
 */
export type TileVariant = "feature" | "card" | "row" | "compact";

const STYLES: Record<
  TileVariant,
  { article: string; picture: string; body: string; title: string; buy: string }
> = {
  feature: {
    article: "flex flex-col",
    picture: "aspect-portrait",
    body: "flex flex-col gap-4 pt-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:pt-6",
    title: "text-2xl",
    buy: "flex shrink-0 items-center justify-between gap-6",
  },
  card: {
    article: "flex flex-col",
    picture: "aspect-portrait",
    body: "flex grow flex-col justify-between gap-4 pt-4",
    title: "text-xl",
    buy: "flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4",
  },
  row: {
    article: "flex flex-col lg:grid lg:grid-cols-5 lg:gap-x-grid",
    picture: "aspect-portrait lg:col-span-2",
    body: "flex grow flex-col justify-between gap-4 pt-4 lg:col-span-3 lg:pt-0",
    title: "text-xl",
    buy: "flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4",
  },
  compact: {
    article: "flex items-center gap-4 lg:gap-6",
    picture: "aspect-portrait w-22 shrink-0 lg:w-30",
    body: "flex grow flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6",
    title: "text-xl",
    buy: "flex items-center gap-4 lg:flex-col lg:items-end lg:gap-2",
  },
};

/**
 * A product in the shop's lists: the whole tile leads to its page, through its name's link,
 * and its button, set above that link, adds it to the cart.
 */
export function ProductTile({
  product,
  currencyCode,
  variant = "card",
  heading: Heading = "h3",
  className,
  pictureClassName,
  bodyClassName,
  titleClassName,
}: {
  product: ProductSummary;
  currencyCode: string;
  variant?: TileVariant;
  /** The name's heading level, below the page's or the section's title. */
  heading?: "h2" | "h3";
  className?: string;
  /** Overrides the variant's picture frame, for a card that turns large at some widths. */
  pictureClassName?: string;
  /** Overrides the variant's text block, for a card that turns large at some widths. */
  bodyClassName?: string;
  /** Overrides the variant's name size, for a card that turns large at some widths. */
  titleClassName?: string;
}) {
  const styles = STYLES[variant];

  return (
    <article className={cn("group relative", styles.article, className)}>
      <ProductPicture product={product} alt="" className={cn(styles.picture, pictureClassName)} />
      <div className={cn(styles.body, bodyClassName)}>
        <div className="flex flex-col gap-1">
          <Heading className={cn(styles.title, titleClassName)}>
            {/* The name's link stretches over the whole tile, picture included. */}
            <SiteLink
              href={product.path}
              className="text-foreground no-underline outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {product.title}
            </SiteLink>
          </Heading>
          {product.subtitle ? (
            <p className="text-sm text-muted-foreground">{product.subtitle}</p>
          ) : null}
          {product.domainOnly ? <p className="text-sm font-medium">Uniquement au domaine</p> : null}
        </div>
        <div className={cn("relative", styles.buy)}>
          {product.price ? <Price>{formatFromPrice(product.price, currencyCode)}</Price> : null}
          <CartAction product={product} currencyCode={currencyCode} />
        </div>
      </div>
    </article>
  );
}
