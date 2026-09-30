import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { renderOrderReadyForPickup } from "../emails/order-ready-for-pickup";
import { sendEmail } from "../emails/send";

type FulfillmentCreated = { order_id: string; fulfillment_id: string; no_notification?: boolean };

export default async function orderReadyForPickup({
  event,
  container,
}: SubscriberArgs<FulfillmentCreated>) {
  if (event.data.no_notification) return;

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [fulfillment],
  } = await query.graph({
    entity: "fulfillment",
    fields: ["location_id", "shipping_option.service_zone.fulfillment_set.type"],
    filters: { id: event.data.fulfillment_id },
  });
  if (fulfillment?.shipping_option?.service_zone?.fulfillment_set?.type !== "pickup") return;

  const [
    {
      data: [order],
    },
    {
      data: [location],
    },
  ] = await Promise.all([
    query.graph({
      entity: "order",
      fields: ["display_id", "email", "customer.first_name", "shipping_address.first_name"],
      filters: { id: event.data.order_id },
    }),
    query.graph({
      entity: "stock_location",
      fields: ["name", "address.address_1", "address.postal_code", "address.city"],
      filters: { id: fulfillment.location_id },
    }),
  ]);
  if (!order?.email || !location) return;

  const { address } = location;
  await sendEmail(container, {
    to: order.email,
    template: "order-ready-for-pickup",
    content: renderOrderReadyForPickup({
      displayId: Number(order.display_id),
      firstName: order.customer?.first_name ?? order.shipping_address?.first_name,
      location: {
        name: location.name,
        address: [address?.address_1, [address?.postal_code, address?.city].join(" ")]
          .filter(Boolean)
          .join(", "),
      },
    }),
  });
}

export const config: SubscriberConfig = { event: "order.fulfillment_created" };
