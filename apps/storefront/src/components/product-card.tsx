import { cn } from "@coupdecanon/ui/lib/utils";
import type { ProductSummary } from "../lib/catalog.server";
import { formatFromPrice } from "../lib/format";
import { Price } from "./price";
import { ProductPicture } from "./product-picture";
import { SiteLink } from "./site-link";

const SIZES = {
  large: { picture: "aspect-portrait md:aspect-landscape lg:aspect-portrait", title: "text-2xl" },
  small: { picture: "aspect-portrait", title: "text-xl" },
} as const;

export function ProductCard({
  product,
  currencyCode,
  size = "small",
  className,
}: {
  product: ProductSummary;
  currencyCode: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const styles = SIZES[size];

  return (
    <SiteLink
      href={product.path}
      className={cn("group flex flex-col text-foreground no-underline", className)}
    >
      {/* The link's text names the product already. */}
      <ProductPicture product={product} alt="" className={styles.picture} />
      <div className="flex flex-col pt-4">
        {/* The name and its description sit together; the price stands apart below. */}
        <div className="flex flex-col gap-1">
          <h3 className={styles.title}>{product.title}</h3>
          {product.subtitle ? (
            <p className="text-sm text-muted-foreground">{product.subtitle}</p>
          ) : null}
          {product.domainOnly ? <p className="text-sm font-medium">Uniquement au domaine</p> : null}
        </div>
        {product.price ? (
          <Price className="mt-4">{formatFromPrice(product.price, currencyCode)}</Price>
        ) : null}
      </div>
    </SiteLink>
  );
}
