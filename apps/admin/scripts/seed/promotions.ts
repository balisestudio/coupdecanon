import { VOLUME_DISCOUNT_KEYS } from "@coupdecanon/config/volume-discounts";
import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createPromotionsWorkflow, updatePromotionsWorkflow } from "@medusajs/medusa/core-flows";
import { FAMILIES, type FamilyName } from "./catalog";

/**
 * The volume discounts the shop opens with. From then on they're the team's: the admin's
 * promotions set their quantities, percentages and targets, and nothing in code reads these.
 */
const INITIAL_TIERS = [
  { code: "VOLUME10", minQuantity: 12, percent: 10 },
  { code: "VOLUME20", minQuantity: 100, percent: 20 },
];

/** The families whose bottles count towards the initial tiers, and get their discount. */
const DRINK_FAMILIES = ["cidre-poire", "jus-de-fruits", "calvados-aperitif", "biere"];

/**
 * Creates the initial volume discounts when missing: promotions by code taking their
 * percentage off each drink, marked with the quantity from which they apply. A promotion that
 * exists without that quantity gets it; one the team changed keeps its settings.
 */
export async function syncVolumeDiscounts(
  container: MedusaContainer,
  familyIds: Map<FamilyName, string>,
) {
  const promotionModule = container.resolve(Modules.PROMOTION);
  const drinkFamilyIds = FAMILIES.filter((family) =>
    DRINK_FAMILIES.includes(family.handle),
  ).flatMap((family) => familyIds.get(family.name) ?? []);
  if (drinkFamilyIds.length !== DRINK_FAMILIES.length) {
    throw new Error("A drink family is missing: sync the families first");
  }

  const existing = await promotionModule.listPromotions({
    code: INITIAL_TIERS.map((tier) => tier.code),
  });
  const missing = INITIAL_TIERS.filter(
    (tier) => !existing.some((promotion) => promotion.code === tier.code),
  );
  const unmarked = existing.flatMap((promotion) => {
    const tier = INITIAL_TIERS.find((candidate) => candidate.code === promotion.code);
    return tier && promotion.metadata?.[VOLUME_DISCOUNT_KEYS.minQuantity] === undefined
      ? [{ promotion, tier }]
      : [];
  });

  if (missing.length) {
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: missing.map((tier) => ({
          code: tier.code,
          type: "standard",
          status: "active",
          // The shop applies the tier a cart reaches; an automatic one would apply to all.
          is_automatic: false,
          metadata: { [VOLUME_DISCOUNT_KEYS.minQuantity]: tier.minQuantity },
          application_method: {
            type: "percentage",
            target_type: "items",
            // A percentage spread across the drinks comes to the same as one on each.
            allocation: "across",
            value: tier.percent,
            target_rules: [
              { attribute: "items.product.categories.id", operator: "in", values: drinkFamilyIds },
            ],
          },
        })),
      },
    });
  }
  if (unmarked.length) {
    await updatePromotionsWorkflow(container).run({
      input: {
        promotionsData: unmarked.map(({ promotion, tier }) => ({
          id: promotion.id,
          metadata: {
            ...promotion.metadata,
            [VOLUME_DISCOUNT_KEYS.minQuantity]: tier.minQuantity,
          },
        })),
      },
    });
  }
}
