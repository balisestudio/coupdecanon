import { RadioCard, RadioGroup } from "@coupdecanon/ui/components/radio-group";
import { useId, useState } from "react";
import type { ProductSummary } from "../lib/catalog.server";
import { formatPrice } from "../lib/format";
import { useCart } from "./cart";
import { FormatCartControl } from "./cart-action";
import { Price } from "./price";

/**
 * A product page's purchase block: the chosen format's price, the formats as cards when there
 * are several, and the cart's control for the chosen format: "Ajouter au panier", then the
 * quantity the cart holds.
 */
export function ProductPurchase({
  product,
  currencyCode,
}: {
  product: ProductSummary;
  currencyCode: string;
}) {
  const id = useId();
  const { lineFor } = useCart();
  // The first format left is chosen at first; a sold-out one can't be.
  const [variantId, setVariantId] = useState(
    (product.formats.find((candidate) => candidate.available) ?? product.formats[0])?.variantId ??
      "",
  );
  const format = product.formats.find((candidate) => candidate.variantId === variantId);
  const several = product.formats.length > 1;

  return (
    <div className="flex flex-col gap-8">
      {format?.price != null ? (
        <p className="flex items-baseline gap-3">
          <Price as="span" className="text-3xl">
            {formatPrice(format.price, currencyCode)}
          </Price>
          <span className="text-sm text-muted-foreground">{format.title}</span>
        </p>
      ) : null}

      {several ? (
        <div className="flex flex-col gap-3">
          <span id={`${id}-format`} className="text-sm font-medium">
            Format
          </span>
          <RadioGroup
            aria-labelledby={`${id}-format`}
            value={variantId}
            onValueChange={setVariantId}
            className="grid-cols-3 gap-2"
          >
            {product.formats.map((option) => {
              const inCart = lineFor(option.variantId)?.quantity;
              return (
                <RadioCard
                  key={option.variantId}
                  value={option.variantId}
                  disabled={!option.available && !inCart}
                >
                  <span className="text-sm font-medium">{option.title}</span>
                  <span className="text-xs">
                    {!option.available
                      ? "Épuisé"
                      : inCart
                        ? `${inCart} dans le panier`
                        : option.price !== null
                          ? formatPrice(option.price, currencyCode)
                          : null}
                  </span>
                </RadioCard>
              );
            })}
          </RadioGroup>
        </div>
      ) : null}

      {format ? (
        // The button becomes the cart's quantity, in its place: a second click on it can only
        // change the quantity.
        <FormatCartControl
          format={format}
          title={several ? `${product.title}, ${format.title}` : product.title}
          addLabel="Ajouter au panier"
          prominent
          className="w-full"
        />
      ) : null}
    </div>
  );
}
