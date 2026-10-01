import { formatPercent, formatPrice, listInFrench } from "./format";

/**
 * Volume discounts are set up in Medusa, not here. Each tier is a promotion that the team
 * gives, in the admin's "Remise sur volume" block, the quantity from which it applies; the
 * promotion's own targets say which items count towards it and get the discount. Tiers with
 * the same targets form a ladder, of which a cart gets the highest tier it reaches.
 */
export const VOLUME_DISCOUNT_KEYS = {
  /** In a promotion's metadata: the quantity of targeted items from which it applies. */
  minQuantity: "volume_min_quantity",
  /** In a cart's metadata, then its order's: the tiers it got, as they were then. */
  applied: "volume_discounts",
} as const;

export type VolumeTier = {
  minQuantity: number;
  type: "percentage" | "fixed";
  /** A percentage, or an amount in the currency. */
  value: number;
  currencyCode: string | null;
};

/** Tiers that count and discount the same items, from the lowest quantity. */
export type VolumeLadder = { tiers: VolumeTier[] };

/** Where a cart stands on a ladder: the items that count, by variant, and their quantity. */
export type VolumeStanding = VolumeLadder & { variantIds: string[]; quantity: number };

/** "10%", or "5€" for a fixed amount. */
export const tierValue = (tier: VolumeTier) =>
  tier.type === "percentage"
    ? formatPercent(tier.value)
    : formatPrice(tier.value, tier.currencyCode ?? "eur");

/** The highest tier a quantity reaches, if any. */
export const reachedTier = (ladder: VolumeLadder, quantity: number) =>
  [...ladder.tiers].reverse().find((tier) => quantity >= tier.minQuantity) ?? null;

/** The discount's name on a cart or an order: "Remise de 10 %", from the tiers it got. */
export const discountLabel = (tiers: VolumeTier[]) =>
  tiers.length ? `Remise de ${listInFrench(tiers.map(tierValue))}` : "Remise";

/** The tiers a cart or an order got, from its metadata; nothing if it holds something else. */
export function appliedTiers(metadata: Record<string, unknown> | null | undefined): VolumeTier[] {
  const value = metadata?.[VOLUME_DISCOUNT_KEYS.applied];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (tier): tier is VolumeTier =>
      typeof tier === "object" &&
      tier !== null &&
      typeof tier.minQuantity === "number" &&
      (tier.type === "percentage" || tier.type === "fixed") &&
      typeof tier.value === "number",
  );
}
