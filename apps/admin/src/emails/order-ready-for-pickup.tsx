import { orderNumber } from "@coupdecanon/config/format";
import { formatHours, type ShopInfo } from "@coupdecanon/config/shop-info";
import type { ReactNode } from "react";
import { Aside, CallToAction, Details, EmailLayout, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";
import { formatAmount } from "./_components/theme";

export type OrderReadyForPickupProps = {
  storefrontUrl: string;
  shop: ShopInfo;
  displayId: number;
  firstName?: string | null;
  location: { name: string; address: string };
  /** What's left to pay at the shop, for an order paid on pickup. */
  amountDue: { total: number; currencyCode: string } | null;
};

const TASTING = "Profitez de votre passage pour découvrir les nouveautés de la boutique.";

/** The wording both the HTML and the plain-text versions show. */
function summarize(order: OrderReadyForPickupProps) {
  const greeting = order.firstName ? `Bonjour ${order.firstName}` : "Bonjour";
  const address = `${order.location.name}, ${order.location.address}`;
  return {
    intro: `${greeting}, votre commande ${orderNumber(order.displayId)} est prête. Vous pouvez venir la chercher à la boutique du domaine.`,
    address,
    directions: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    // The shop's hours, as the team set them in the admin, days with the same hours together.
    hours: order.shop.hours
      ? formatHours(order.shop.hours).map((line) => `${line.days} : ${line.times}`)
      : [],
    due: order.amountDue
      ? `${formatAmount(order.amountDue.total, order.amountDue.currencyCode)}, sur place`
      : null,
  };
}

export default function OrderReadyForPickup(order: OrderReadyForPickupProps) {
  const { intro, address, directions, hours, due } = summarize(order);

  return (
    <EmailLayout preview={intro} storefrontUrl={order.storefrontUrl} shop={order.shop}>
      <Title>Votre commande vous attend</Title>
      <Paragraph>{intro}</Paragraph>
      <Details
        rows={[
          ["Adresse", address],
          ...(hours.length
            ? [
                [
                  "Horaires",
                  hours.map((line, index) => (
                    <span key={line}>
                      {index ? <br /> : null}
                      {line}
                    </span>
                  )),
                ] as [string, ReactNode],
              ]
            : []),
          ...(due ? [["À régler", due] as [string, ReactNode]] : []),
          [
            "À présenter",
            <strong key="order" style={{ fontWeight: 500 }}>
              Commande {orderNumber(order.displayId)}
            </strong>,
          ],
        ]}
      />
      <CallToAction href={directions}>Voir l’itinéraire</CallToAction>
      <Aside>{TASTING}</Aside>
    </EmailLayout>
  );
}

OrderReadyForPickup.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  displayId: 1043,
  firstName: "Camille",
  location: { name: "Château de Ouézy", address: "22 rue Auguste Lemonnier, 14270 Ouézy" },
  amountDue: { total: 86.4, currencyCode: "eur" },
} satisfies OrderReadyForPickupProps;

export function renderOrderReadyForPickup(order: OrderReadyForPickupProps) {
  const { intro, address, directions, hours, due } = summarize(order);

  return renderEmail(
    `Votre commande ${orderNumber(order.displayId)} est prête`,
    <OrderReadyForPickup {...order} />,
    [
      intro,
      "",
      `Adresse : ${address}`,
      ...(hours.length ? ["Horaires :", ...hours] : []),
      ...(due ? [`À régler : ${due}`] : []),
      `À présenter : commande ${orderNumber(order.displayId)}`,
      `Itinéraire : ${directions}`,
      "",
      TASTING,
    ],
    order.shop,
  );
}
