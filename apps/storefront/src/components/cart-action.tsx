import { Button } from "@coupdecanon/ui/components/button";
import { QuantityStepper } from "@coupdecanon/ui/components/quantity-stepper";
import { cn } from "@coupdecanon/ui/lib/utils";
import { useEffect, useRef } from "react";
import type { ProductFormat, ProductSummary } from "../lib/catalog.server";
import { useCart } from "./cart";
import { FormatSheet } from "./format-sheet";

/**
 * The cart's control for one format of a product: "Ajouter" while the cart holds none, then
 * the quantity it holds, between a minus and a plus; never a quantity of its own. Each click
 * shows at once: the cart sends it to Medusa behind the scenes, and says so if Medusa refuses
 * it. When one control gives way to the other, the keyboard's focus follows.
 */
export function FormatCartControl({
  format,
  title,
  addLabel = "Ajouter",
  prominent = false,
  className,
}: {
  format: ProductFormat;
  /** What is counted, for screen readers: "Cidre brut", "Cidre brut, 75 cl". */
  title: string;
  addLabel?: string;
  /**
   * The product page's large, filled button, rather than the lists' small outlined one; its
   * quantity then takes the whole width.
   */
  prominent?: boolean;
  className?: string;
}) {
  const { variantId } = format;
  const { lines, count, lineFor, setQuantity } = useCart();
  const line = lineFor(variantId);
  // A cart that holds something, not loaded yet, may hold this: the button waits, unseen.
  const pending = lines === null && (count ?? 0) > 0;
  const wrapper = useRef<HTMLSpanElement>(null);
  const focusNext = useRef(false);
  const change = (quantity: number) => {
    // The control clicked goes away when the line appears or leaves: focus follows it.
    focusNext.current = !line || quantity === 0;
    setQuantity(variantId, quantity).catch(() => {});
  };

  const inCart = Boolean(line);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const buttons = wrapper.current?.querySelectorAll("button");
    // Into the cart: on to "one more"; out of it: back to "Ajouter".
    (inCart ? buttons?.[buttons.length - 1] : buttons?.[0])?.focus();
  }, [inCart]);

  const size = prominent ? "lg" : "sm";
  return (
    <span ref={wrapper} className="contents">
      {line ? (
        <QuantityStepper
          value={line.quantity}
          label={title}
          max={format.maxQuantity ?? undefined}
          onDecrement={() => change(line.quantity - 1)}
          onIncrement={() => change(line.quantity + 1)}
          size={size}
          className={cn(prominent && "justify-between", className)}
        />
      ) : (
        <Button
          type="button"
          variant={prominent ? "default" : "outline"}
          size={size}
          disabled={!format.available}
          aria-label={format.available ? `${addLabel} : ${title}` : `${title} : épuisé`}
          onClick={() => change(1)}
          className={cn(pending && "invisible", className)}
        >
          {format.available ? addLabel : "Épuisé"}
        </Button>
      )}
      <span role="status" className="sr-only">
        {line ? `${title} : ${line.quantity} dans le panier` : ""}
      </span>
    </span>
  );
}

/** A product none of whose formats is left: said plainly, in place of "Ajouter". */
function SoldOut({ title }: { title: string }) {
  return (
    <Button type="button" variant="outline" size="sm" disabled aria-label={`${title} : épuisé`}>
      Épuisé
    </Button>
  );
}

/**
 * A product's control in lists. A product sold in one format goes straight to the cart, then
 * shows its quantity there; one sold in several opens a drawer with each format's control.
 */
export function CartAction({
  product,
  currencyCode,
}: {
  product: ProductSummary;
  currencyCode: string;
}) {
  const [only] = product.formats;
  if (product.formats.length === 1 && only) {
    return <FormatCartControl format={only} title={product.title} />;
  }
  if (!product.formats.some((format) => format.available)) return <SoldOut title={product.title} />;
  return <FormatSheet product={product} currencyCode={currencyCode} />;
}
