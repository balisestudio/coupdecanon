import { pluralize } from "@coupdecanon/config/format";
import {
  discountLabel,
  reachedTier,
  type VolumeStanding,
  type VolumeTier,
} from "@coupdecanon/config/volume-discounts";
import { Button } from "@coupdecanon/ui/components/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@coupdecanon/ui/components/empty";
import { QuantityStepper } from "@coupdecanon/ui/components/quantity-stepper";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { type CartState, useCart } from "../../components/cart";
import { Container } from "../../components/container";
import { OrderTotals, SummaryPanel } from "../../components/order-summary";
import { Price } from "../../components/price";
import { ProductCard } from "../../components/product-card";
import { ProductPicture } from "../../components/product-picture";
import { SectionHeading } from "../../components/section-heading";
import { SiteLink } from "../../components/site-link";
import { type CartDetails, getCartPage } from "../../lib/cart";
import { formatAmount, formatPrice } from "../../lib/format";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/basket")({
  loader: () => getCartPage(),
  head: () => ({
    meta: [{ title: pageTitle("Votre panier") }, { name: "robots", content: "noindex, follow" }],
  }),
  component: Cart,
});

type Line = CartDetails["lines"][number];

/** How many items of a ladder's formats the lines hold. */
const quantityOn = (standing: VolumeStanding, lines: Line[]) =>
  lines.reduce(
    (sum, line) => (standing.variantIds.includes(line.variantId) ? sum + line.quantity : sum),
    0,
  );

/** What a tier takes off the lines it counts, as Medusa works it out for a percentage. */
function discountOf(tier: VolumeTier, standing: VolumeStanding, lines: Line[]) {
  if (tier.type === "fixed") return tier.value;
  const amount = lines.reduce(
    (sum, line) =>
      standing.variantIds.includes(line.variantId) ? sum + line.unitPrice * line.quantity : sum,
    0,
  );
  return Math.round(amount * tier.value) / 100;
}

/**
 * The cart as the customer sees it: Medusa's lines at the quantities they chose. Until Medusa
 * confirms the changes, the page works out the amounts itself, as Medusa will; its own figures
 * then take over.
 */
function useLiveCart(cart: CartDetails | null, live: CartState) {
  const lines = (cart?.lines ?? []).flatMap((line) => {
    if (!live.lines) return [line];
    const current = live.lines.find((candidate) => candidate.variantId === line.variantId);
    return current ? [{ ...line, quantity: current.quantity }] : [];
  });
  const confirmed =
    !live.syncing &&
    (!live.lines ||
      (live.lines.length === cart?.lines.length &&
        live.lines.every(
          (line) =>
            cart.lines.find((candidate) => candidate.variantId === line.variantId)?.quantity ===
            line.quantity,
        )));
  if (!cart || confirmed) return { cart, lines, confirmed: true };

  const reached = cart.volume.flatMap((standing) => {
    const tier = reachedTier(standing, quantityOn(standing, lines));
    return tier ? [{ tier, standing }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discount = reached.reduce(
    (sum, { tier, standing }) => sum + discountOf(tier, standing, lines),
    0,
  );
  return {
    cart: {
      ...cart,
      lines,
      subtotal,
      discount,
      total: subtotal - discount,
      discountLabel: discountLabel(reached.map(({ tier }) => tier)),
    },
    lines,
    confirmed: false,
  };
}

function CartLineRow({
  line,
  currencyCode,
  onRemove,
}: {
  line: Line;
  currencyCode: string;
  onRemove: (title: string) => void;
}) {
  const { setQuantity } = useCart();
  const change = (quantity: number) => {
    if (!quantity) onRemove(line.title);
    setQuantity(line.variantId, quantity).catch(() => {});
  };
  return (
    <li className="grid grid-cols-4 items-center gap-x-4 gap-y-4 lg:grid-cols-8 lg:gap-x-grid">
      <div className="col-span-1">
        <ProductPicture
          product={{
            thumbnail: line.thumbnail,
            title: line.title,
            family: null,
            handle: line.handle ?? line.id,
          }}
          alt=""
          className="aspect-portrait"
        />
      </div>
      <div className="col-span-3 flex flex-col items-start gap-1 lg:col-span-4">
        <SiteLink
          href={line.href ?? undefined}
          className="font-serif text-xl font-medium text-foreground no-underline"
        >
          {line.title}
        </SiteLink>
        <p className="text-sm text-muted-foreground">
          {line.format ? `${line.format}, ` : ""}
          {formatPrice(line.unitPrice, currencyCode)} l’unité
        </p>
      </div>
      <div className="col-span-3 col-start-2 flex items-center justify-between gap-4 lg:col-span-3 lg:col-start-6">
        {/* Down to 0, the line leaves the cart. */}
        <QuantityStepper
          value={line.quantity}
          label={line.title}
          onDecrement={() => change(line.quantity - 1)}
          onIncrement={() => change(line.quantity + 1)}
        />
        <Price as="span">{formatAmount(line.unitPrice * line.quantity, currencyCode)}</Price>
      </div>
    </li>
  );
}

function Cart() {
  const { cart: loaded, suggestions, currencyCode } = Route.useLoaderData();
  const router = useRouter();
  const live = useCart();
  const { cart, lines, confirmed } = useLiveCart(loaded, live);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const list = useRef<HTMLUListElement>(null);
  const [removed, setRemoved] = useState("");
  // A line that leaves takes its buttons with it: the focus goes back to the list, which says so.
  const onRemove = (title: string) => {
    setRemoved(`${title} retiré du panier.`);
    requestAnimationFrame(() => list.current?.focus());
  };

  // Once the cart settles with Medusa after changes, the page takes Medusa's figures again.
  const settledAt = useRef(live.version);
  useEffect(() => {
    if (live.version === settledAt.current) return;
    settledAt.current = live.version;
    router.invalidate({ filter: (match) => match.routeId === Route.id });
  }, [live.version, router]);

  return (
    <div className="pb-section">
      <Container className="py-block">
        <SectionHeading
          action={
            count ? (
              <p className="text-lg text-muted-foreground">{pluralize(count, "article")}</p>
            ) : null
          }
        >
          <h1 className="text-4xl">Votre panier</h1>
        </SectionHeading>
      </Container>

      {cart && lines.length ? (
        <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
          <div className="flex flex-col gap-stack lg:col-span-8">
            <ul
              ref={list}
              tabIndex={-1}
              aria-label="Articles"
              className="flex flex-col gap-8 outline-none"
            >
              {lines.map((line) => (
                <CartLineRow
                  key={line.variantId}
                  line={line}
                  currencyCode={cart.currencyCode}
                  onRemove={onRemove}
                />
              ))}
            </ul>
            <p role="status" className="sr-only">
              {removed}
            </p>
          </div>
          <SummaryPanel title="Récapitulatif" className="lg:col-span-4 lg:col-start-9">
            <OrderTotals
              subtotal={cart.subtotal}
              discount={cart.discount}
              total={cart.total}
              discountLabel={cart.discountLabel}
              currencyCode={cart.currencyCode}
              updating={!confirmed}
            />
            {/* The checkout reads the cart from Medusa: it opens once the changes reached it. */}
            {live.syncing ? (
              <Button size="lg" className="w-full" loading>
                Passer commande
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout">Passer commande</Link>
              </Button>
            )}
          </SummaryPanel>
        </Container>
      ) : (
        <Container>
          <Empty className="items-start text-left">
            <EmptyHeader className="items-start">
              <EmptyTitle className="text-3xl">Votre panier est vide.</EmptyTitle>
            </EmptyHeader>
            <EmptyContent className="items-start">
              <Button asChild>
                <Link to="/cellar">Parcourir la boutique</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </Container>
      )}

      {suggestions.length ? (
        <section aria-labelledby="completer-titre" className="pt-section">
          <Container className="flex flex-col gap-block">
            <h2 id="completer-titre" className="text-3xl">
              {lines.length ? "Pour compléter" : "Nos préférés"}
            </h2>
            <div className="grid grid-cols-2 items-start gap-x-grid gap-y-block lg:grid-cols-3">
              {suggestions.map((product) => (
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
      ) : null}
    </div>
  );
}
