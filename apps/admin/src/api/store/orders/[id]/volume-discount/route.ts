import { appliedTiers } from "@coupdecanon/config/volume-discounts";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";

/**
 * The volume discount tiers an order got, as they were when it was placed, to name its
 * discount. The store API leaves out an order's metadata, where the cart noted them.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["metadata"],
    filters: { id: req.params.id as string },
  });
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order ${req.params.id} was not found`);
  }
  res.json({ tiers: appliedTiers(order.metadata) });
}
