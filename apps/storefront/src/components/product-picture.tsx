import { cn } from "@coupdecanon/ui/lib/utils";
import type { ProductSummary } from "../lib/catalog.server";
import { ProductSilhouette } from "./product-silhouette";

/**
 * A product's photo, which zooms a touch while its card is hovered; without one, a cut-out
 * bottle or jar stands in. The frame takes its size and ratio from `className`.
 */
export function ProductPicture({
  product,
  alt = product.title,
  className,
}: {
  product: Pick<ProductSummary, "thumbnail" | "title" | "family" | "handle">;
  /** Empty when the product's name already sits beside the photo. */
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-center overflow-hidden bg-card",
        !product.thumbnail && "pb-8",
        className,
      )}
    >
      {product.thumbnail ? (
        <img
          src={product.thumbnail}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-102"
        />
      ) : (
        <ProductSilhouette
          family={product.family}
          name={product.handle}
          className="h-2/3 w-auto data-jar:h-1/3"
        />
      )}
    </div>
  );
}
