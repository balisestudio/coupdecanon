import { orderNumber } from "@coupdecanon/config/format";
import { PATHS } from "@coupdecanon/config/routes";
import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { discountLabel, type VolumeTier } from "@coupdecanon/config/volume-discounts";
import {
  CallToAction,
  EmailLayout,
  LineItems,
  Panel,
  Paragraph,
  Subtitle,
  Title,
  type TotalLine,
  Totals,
} from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";
import { formatAmount, formatDate } from "./_components/theme";

export type OrderPlacedProps = {
  storefrontUrl: string;
  shop: ShopInfo;
  /** The order's id, for its page in the customer's account. */
  orderId: string;
  displayId: number;
  placedAt: Date;
  firstName?: string | null;
  hasAccount: boolean;
  currencyCode: string;
  items: {
    title: string;
    variant?: string | null;
    thumbnail?: string | null;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  discountTotal: number;
  /** The volume discount tiers the order got, which name its discount. */
  volumeDiscounts: VolumeTier[];
  shipping?: { name: string; total: number } | null;
  pickupLocation?: { name: string; address: string } | null;
  total: number;
  taxTotal: number;
  /** Paid at the estate's shop on pickup, rather than online. */
  paidOnPickup: boolean;
};

/** The wording and amounts both the HTML and the plain-text versions show. */
function summarize(order: OrderPlacedProps) {
  const greeting = order.firstName ? `Bonjour ${order.firstName}` : "Bonjour";
  const price = (amount: number) => formatAmount(amount, order.currencyCode);

  const lines: TotalLine[] = [{ label: "Sous-total", value: price(order.subtotal) }];
  if (order.discountTotal > 0) {
    lines.push({
      label: discountLabel(order.volumeDiscounts),
      value: `−${price(order.discountTotal)}`,
      tone: "discount",
    });
  }
  if (order.shipping) {
    const { name, total } = order.shipping;
    lines.push({ label: name, value: total === 0 ? "Gratuit" : price(total), tone: "muted" });
  }

  return {
    intro: `${greeting}, votre commande ${orderNumber(order.displayId)} du ${formatDate(order.placedAt)} est bien enregistrée. Nous la préparons au domaine.`,
    // A customer with an account follows the order on its own page there.
    trackingUrl: order.hasAccount
      ? `${order.storefrontUrl.replace(/\/$/, "")}${PATHS.accountOrder(order.orderId)}`
      : null,
    items: order.items.map((item) => ({
      title: item.title,
      description: item.variant
        ? `${item.quantity} × ${item.variant}`
        : `Quantité : ${item.quantity}`,
      thumbnail: item.thumbnail,
      price: price(item.total),
    })),
    lines,
    total: {
      label: order.paidOnPickup ? "À régler au retrait" : "Total payé",
      value: price(order.total),
      caption: order.taxTotal > 0 ? `Dont TVA : ${price(order.taxTotal)}` : undefined,
    },
    tax: price(order.taxTotal),
    pickup: order.pickupLocation
      ? `${order.pickupLocation.name}, ${order.pickupLocation.address}. Nous vous écrivons dès que votre commande est prête.`
      : null,
  };
}

export default function OrderPlaced(order: OrderPlacedProps) {
  const summary = summarize(order);

  return (
    <EmailLayout preview={summary.intro} storefrontUrl={order.storefrontUrl} shop={order.shop}>
      <Title>Merci pour votre commande</Title>
      <Paragraph>{summary.intro}</Paragraph>
      {summary.trackingUrl ? (
        <CallToAction href={summary.trackingUrl}>Suivre ma commande</CallToAction>
      ) : null}
      <Subtitle>Récapitulatif</Subtitle>
      <LineItems items={summary.items} />
      <Totals lines={summary.lines} total={summary.total} />
      {summary.pickup ? <Panel title="Retrait à la boutique">{summary.pickup}</Panel> : null}
    </EmailLayout>
  );
}

OrderPlaced.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  orderId: "order_01EXEMPLE",
  displayId: 1043,
  placedAt: new Date("2026-09-29T10:12:00+02:00"),
  firstName: "Camille",
  hasAccount: true,
  currencyCode: "eur",
  items: [
    { title: "Calvados fermier", variant: "75 cl", quantity: 1, total: 30 },
    { title: "Le Champoiré", variant: "75 cl", quantity: 6, total: 42 },
    { title: "Jus de pomme", variant: "1 l", quantity: 6, total: 24 },
  ],
  subtotal: 96,
  discountTotal: 9.6,
  volumeDiscounts: [{ minQuantity: 12, type: "percentage", value: 10, currencyCode: null }],
  shipping: { name: "Retrait au domaine", total: 0 },
  pickupLocation: {
    name: "Château de Ouézy",
    address: "22 rue Auguste Lemonnier, 14270 Ouézy",
  },
  total: 86.4,
  taxTotal: 14.4,
  paidOnPickup: true,
} satisfies OrderPlacedProps;

export function renderOrderPlaced(order: OrderPlacedProps) {
  const summary = summarize(order);

  return renderEmail(
    `Merci pour votre commande ${orderNumber(order.displayId)}`,
    <OrderPlaced {...order} />,
    [
      summary.intro,
      ...(summary.trackingUrl ? ["", `Suivre ma commande : ${summary.trackingUrl}`] : []),
      "",
      "Récapitulatif",
      ...summary.items.map((item) => `${item.title}, ${item.description} : ${item.price}`),
      "",
      ...summary.lines.map((line) => `${line.label} : ${line.value}`),
      `${summary.total.label} : ${summary.total.value}${order.taxTotal > 0 ? ` (dont TVA : ${summary.tax})` : ""}`,
      ...(summary.pickup ? ["", `Retrait à la boutique : ${summary.pickup}`] : []),
    ],
    order.shop,
  );
}
