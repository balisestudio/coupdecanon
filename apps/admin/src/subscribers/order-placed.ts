import { env } from "@coupdecanon/config/env";
import { appliedTiers } from "@coupdecanon/config/volume-discounts";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { formatAddress } from "../emails/_components/theme";
import { renderOrderPlaced } from "../emails/order-placed";
import { sendEmail } from "../emails/send";
import { retrieveShopInfo } from "../lib/shop";

/** The stock location a pickup shipping option hands the order over at, if it is one. */
async function retrievePickupLocation(container: MedusaContainer, shippingOptionId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [option],
  } = await query.graph({
    entity: "shipping_option",
    fields: [
      "service_zone.fulfillment_set.type",
      "service_zone.fulfillment_set.location.name",
      "service_zone.fulfillment_set.location.address.address_1",
      "service_zone.fulfillment_set.location.address.postal_code",
      "service_zone.fulfillment_set.location.address.city",
    ],
    filters: { id: shippingOptionId },
  });
  const fulfillmentSet = option?.service_zone?.fulfillment_set;
  if (fulfillmentSet?.type !== "pickup" || !fulfillmentSet.location) return null;

  const { location } = fulfillmentSet;
  return { name: location.name, address: formatAddress(location.address ?? undefined) };
}

export default async function orderPlaced({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "display_id",
      "created_at",
      "email",
      "currency_code",
      "original_item_total",
      "discount_total",
      "total",
      "tax_total",
      "metadata",
      "payment_collections.payment_sessions.provider_id",
      "items.product_title",
      "items.variant_title",
      "items.thumbnail",
      "items.quantity",
      "items.original_total",
      "shipping_methods.name",
      "shipping_methods.total",
      "shipping_methods.shipping_option_id",
      "customer.first_name",
      "customer.has_account",
      "shipping_address.first_name",
    ],
    filters: { id: event.data.id },
  });
  if (!order?.email) return;

  const shippingMethod = order.shipping_methods?.[0];
  const pickupLocation = shippingMethod?.shipping_option_id
    ? await retrievePickupLocation(container, shippingMethod.shipping_option_id)
    : null;

  await sendEmail(container, {
    to: order.email,
    template: "order-placed",
    content: await renderOrderPlaced({
      storefrontUrl: env.STOREFRONT_URL,
      shop: await retrieveShopInfo(container),
      orderId: event.data.id,
      displayId: Number(order.display_id),
      placedAt: new Date(order.created_at),
      firstName: order.customer?.first_name ?? order.shipping_address?.first_name,
      hasAccount: Boolean(order.customer?.has_account),
      currencyCode: order.currency_code,
      items: (order.items ?? []).flatMap((item) =>
        item
          ? [
              {
                title: item.product_title ?? "",
                variant: item.variant_title,
                thumbnail: item.thumbnail,
                quantity: Number(item.quantity),
                total: Number(item.original_total),
              },
            ]
          : [],
      ),
      subtotal: Number(order.original_item_total),
      discountTotal: Number(order.discount_total),
      // The tiers the cart got, as they were then: the promotions may have changed since.
      volumeDiscounts: appliedTiers(order.metadata),
      shipping: shippingMethod
        ? { name: shippingMethod.name, total: Number(shippingMethod.total) }
        : null,
      pickupLocation,
      total: Number(order.total),
      taxTotal: Number(order.tax_total),
      // Medusa's system provider stands for the payment at pickup: nothing is paid yet.
      paidOnPickup: (order.payment_collections ?? []).some((collection) =>
        collection?.payment_sessions?.some(
          (session) => session?.provider_id === "pp_system_default",
        ),
      ),
    }),
  });
}

export const config: SubscriberConfig = { event: "order.placed" };
