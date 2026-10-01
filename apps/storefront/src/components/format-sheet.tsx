import { Button } from "@coupdecanon/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@coupdecanon/ui/components/sheet";
import type { ProductSummary } from "../lib/catalog.server";
import { formatPrice } from "../lib/format";
import { PATHS } from "../lib/paths";
import { useCart } from "./cart";
import { FormatCartControl } from "./cart-action";
import { Price } from "./price";
import { ProductPicture } from "./product-picture";
import { SiteLink } from "./site-link";

/**
 * The lists' control for a product sold in several formats: a button that says how many the
 * cart holds, all formats together, or "Ajouter" while it holds none. It opens a drawer where
 * each format has its own control, the quantity in the cart included.
 */
export function FormatSheet({
  product,
  currencyCode,
}: {
  product: ProductSummary;
  currencyCode: string;
}) {
  const { lines, count, lineFor } = useCart();
  // A cart that holds something, not loaded yet, may hold these: the button waits, unseen.
  const pending = lines === null && (count ?? 0) > 0;
  const inCart = product.formats.reduce(
    (sum, format) => sum + (lineFor(format.variantId)?.quantity ?? 0),
    0,
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={pending ? "invisible" : undefined}
          aria-label={
            inCart
              ? `${product.title} : ${inCart} dans le panier, choisir les formats`
              : `Ajouter ${product.title} au panier, au choix du format`
          }
        >
          {inCart ? `${inCart}\u00a0dans le panier` : "Ajouter"}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0">
        <SheetHeader className="gap-2 p-6 pr-14">
          <SheetTitle className="text-3xl">{product.title}</SheetTitle>
          <SheetDescription className={product.subtitle ? undefined : "sr-only"}>
            {product.subtitle ?? "Choisissez les formats et leur quantité."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex grow flex-col gap-8 overflow-y-auto px-6 pb-6">
          <ProductPicture product={product} alt="" className="aspect-landscape" />
          <ul aria-label="Formats" className="flex flex-col gap-6">
            {product.formats.map((format) => (
              <li key={format.variantId} className="flex min-h-11 items-center gap-4">
                <span className="flex grow flex-col">
                  <span>{format.title}</span>
                  {format.price !== null ? (
                    <Price as="span" className="text-lg">
                      {formatPrice(format.price, currencyCode)}
                    </Price>
                  ) : null}
                </span>
                <FormatCartControl format={format} title={`${product.title}, ${format.title}`} />
              </li>
            ))}
          </ul>
        </div>

        {inCart ? (
          <SheetFooter className="p-6">
            <Button asChild size="lg" className="w-full">
              <SiteLink href={PATHS.cart}>Voir le panier</SiteLink>
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
