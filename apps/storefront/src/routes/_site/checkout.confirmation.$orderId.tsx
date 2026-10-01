import { orderNumber } from "@coupdecanon/config/format";
import { formatAddress } from "@coupdecanon/config/shop-info";
import { Button } from "@coupdecanon/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Arch } from "../../components/arch";
import { Container } from "../../components/container";
import { OpeningHours } from "../../components/opening-hours";
import { OrderTotals } from "../../components/order-summary";
import { Photo } from "../../components/photo";
import { SiteLink } from "../../components/site-link";
import { getOrderConfirmation } from "../../lib/cart";
import { linkOf } from "../../lib/content";
import { formatAmount } from "../../lib/format";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/checkout/confirmation/$orderId")({
  loader: ({ params }) => getOrderConfirmation({ data: { orderId: params.orderId } }),
  head: () => ({
    meta: [
      { title: pageTitle("Commande confirmée") },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { order, pickup, hours, content } = Route.useLoaderData();
  const pickupDayLink = linkOf(content.pickupDay.link);

  return (
    <div className="pb-section">
      <Container className="flex flex-col gap-block pt-block lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-grid">
        <div className="flex flex-col gap-stack lg:col-span-6">
          <h1 className="text-4xl">{order.firstName ? `Merci, ${order.firstName}` : "Merci"}</h1>
          <p className="max-w-text text-lg">
            Votre commande {orderNumber(order.displayId)} est enregistrée.
            {order.email ? ` Un e-mail de confirmation vient de partir à ${order.email}.` : ""}
          </p>
          <p className="max-w-text text-muted-foreground">
            Nous la préparons au domaine et vous écrivons dès qu’elle vous attend à la boutique.
          </p>
          {pickup ? (
            <div className="flex flex-col gap-2">
              <p className="font-serif text-xl font-medium">Retrait</p>
              <p className="text-sm text-muted-foreground">
                Boutique du {formatAddress(pickup.address)}
              </p>
              {hours ? (
                <OpeningHours hours={hours} className="text-sm text-muted-foreground" />
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {order.inAccount ? (
              <Button asChild>
                <Link to="/account/orders/$orderId" params={{ orderId: order.id }}>
                  Suivre ma commande
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/cellar">Parcourir la boutique</Link>
              </Button>
            )}
          </div>
        </div>
        <Arch
          name={`commande-${order.id}`}
          className="aspect-portrait lg:col-span-5 lg:col-start-8"
        >
          <Photo
            media={content.photo}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="size-full"
          />
        </Arch>
      </Container>

      <Container className="flex flex-col gap-block pt-section lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <section
          aria-labelledby="recap-titre"
          className="flex flex-col gap-6 bg-card p-8 lg:col-span-7"
        >
          <h2 id="recap-titre" className="text-3xl">
            Récapitulatif
          </h2>
          <ul className="flex flex-col gap-4">
            {order.lines.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-6">
                <span className="flex flex-col gap-1">
                  <span className="font-serif text-xl font-medium">{line.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {line.quantity}
                    {line.format ? ` × ${line.format}` : ""}
                  </span>
                </span>
                <span className="text-sm">{formatAmount(line.total, order.currencyCode)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals
            subtotal={order.subtotal}
            discount={order.discount}
            total={order.total}
            discountLabel={order.discountLabel}
            currencyCode={order.currencyCode}
            totalLabel={order.paidOnPickup ? "À régler au retrait" : "Total payé"}
          />
        </section>
        <section
          aria-labelledby="retrait-titre"
          className="flex flex-col gap-stack lg:col-span-4 lg:col-start-9"
        >
          <h2 id="retrait-titre" className="text-3xl">
            {content.pickupDay.title}
          </h2>
          {content.pickupDay.text ? <p>{content.pickupDay.text}</p> : null}
          {pickupDayLink ? (
            <SiteLink
              href={pickupDayLink.url}
              className="self-start text-sm font-medium link-underline"
            >
              {pickupDayLink.label}
            </SiteLink>
          ) : null}
        </section>
      </Container>
    </div>
  );
}
