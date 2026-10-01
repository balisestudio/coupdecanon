import { discountLabel, type VolumeTier } from "@coupdecanon/config/volume-discounts";
import { medusa } from "./medusa.server";

/**
 * The name of an order's discount, from the volume discount tiers it got when placed: the
 * store API leaves out an order's metadata, where the cart noted them, and a route of the
 * shop's gives them instead.
 */
export const orderDiscountLabel = (orderId: string) =>
  medusa.client
    .fetch<{ tiers: VolumeTier[] }>(`/store/orders/${orderId}/volume-discount`)
    .then((response) => discountLabel(response.tiers))
    .catch(() => discountLabel([]));
