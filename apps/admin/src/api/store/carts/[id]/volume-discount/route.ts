import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { syncVolumeDiscount, volumeStandingOf } from "../../../../../lib/volume-discount";

const cartIdOf = (req: MedusaRequest) => req.params.id as string;

function orNotFound<T>(value: T | null, cartId: string) {
  if (value === null) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart ${cartId} was not found`);
  }
  return value;
}

/** Where the cart stands on the volume discounts: what counts, and how far to each tier. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const standings = await volumeStandingOf(req.scope, cartIdOf(req));
  res.json({ standings: orNotFound(standings, cartIdOf(req)) });
}

/** Brings the cart's volume discounts in line with its items, after the shop changed it. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const standings = await syncVolumeDiscount(req.scope, cartIdOf(req));
  res.json({ standings: orNotFound(standings, cartIdOf(req)) });
}
