import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { renderOrderPlaced } from "../emails/order-placed";
import { sendEmail } from "../emails/send";

export default async function orderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "display_id",
      "email",
      "currency_code",
      "total",
      "tax_total",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.total",
      "shipping_methods.name",
      "customer.first_name",
      "shipping_address.first_name",
    ],
    filters: { id: event.data.id },
  });
  if (!order?.email) return;

  await sendEmail(container, {
    to: order.email,
    template: "order-placed",
    content: renderOrderPlaced({
      displayId: Number(order.display_id),
      firstName: order.customer?.first_name ?? order.shipping_address?.first_name,
      currencyCode: order.currency_code,
      items: (order.items ?? []).flatMap((item) =>
        item
          ? [
              {
                title: item.variant_title
                  ? `${item.product_title} – ${item.variant_title}`
                  : (item.product_title ?? ""),
                quantity: Number(item.quantity),
                total: Number(item.total),
              },
            ]
          : [],
      ),
      shippingMethod: order.shipping_methods?.[0]?.name,
      total: Number(order.total),
      taxTotal: Number(order.tax_total),
    }),
  });
}

export const config: SubscriberConfig = { event: "order.placed" };
