import {
  appliedTiers,
  VOLUME_DISCOUNT_KEYS,
  type VolumeLadder,
  type VolumeStanding,
  type VolumeTier,
} from "@coupdecanon/config/volume-discounts";
import type { MedusaContainer, PromotionDTO } from "@medusajs/framework/types";
import {
  ApplicationMethodTargetType,
  ComputedActions,
  ContainerRegistrationKeys,
  Modules,
  PromotionActions,
  PromotionStatus,
  PromotionType,
} from "@medusajs/framework/utils";
import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Volume discounts, as the team sets them up in Medusa (see `@coupdecanon/config/volume-
 * discounts`): a promotion by code, on items, whose metadata holds the quantity of its targeted
 * items from which it applies. Nothing about the tiers lives in code: their quantities,
 * amounts and targets are the promotions'.
 */

/** A tier with the promotion behind it. */
type Tier = VolumeTier & { code: string };
type Ladder = { tiers: Tier[] };

/**
 * The cart as Medusa's promotions see it: the fields their conditions and targets can read,
 * as in Medusa's own cart workflows, without the adjustments already applied.
 */
const PROMOTION_CONTEXT_FIELDS = [
  "id",
  "currency_code",
  "region_id",
  "sales_channel_id",
  "customer_id",
  "email",
  "metadata",
  "subtotal",
  "item_total",
  "items.*",
  "items.product.id",
  "items.product.collection_id",
  "items.product.categories.id",
  "items.product.tags.id",
  "items.product.type_id",
  "items.variant.id",
  "shipping_address.country_code",
  "customer.groups.id",
  "promotions.code",
];

/** The minimum quantity a promotion's metadata sets, if it's a whole number of 2 or more. */
function minQuantityOf(promotion: PromotionDTO) {
  const value = Number(promotion.metadata?.[VOLUME_DISCOUNT_KEYS.minQuantity]);
  return Number.isInteger(value) && value >= 2 ? value : null;
}

/** Whether a promotion can be a tier: by code, taking a value off items, running today. */
function isTier(promotion: PromotionDTO, now: Date) {
  const method = promotion.application_method;
  const campaign = promotion.campaign;
  return (
    Boolean(promotion.code) &&
    // An automatic promotion applies itself, whatever the quantity.
    !promotion.is_automatic &&
    promotion.type === PromotionType.STANDARD &&
    method?.target_type === ApplicationMethodTargetType.ITEMS &&
    (method.type === "percentage" || method.type === "fixed") &&
    (!campaign?.starts_at || new Date(campaign.starts_at) <= now) &&
    (!campaign?.ends_at || new Date(campaign.ends_at) >= now)
  );
}

/** The targets of a promotion, written the same way whatever their order. */
const targetsOf = (promotion: PromotionDTO) =>
  JSON.stringify(
    (promotion.application_method?.target_rules ?? [])
      .map((rule) => [
        rule.attribute,
        rule.operator,
        (rule.values ?? []).map((value) => value.value).sort(),
      ])
      .sort(),
  );

/** The volume discounts the team set up and running today, as ladders. */
export async function listVolumeLadders(container: MedusaContainer): Promise<Ladder[]> {
  const promotionModule = container.resolve(Modules.PROMOTION);
  const promotions = await promotionModule.listPromotions(
    { status: [PromotionStatus.ACTIVE] },
    {
      relations: [
        "application_method",
        "application_method.target_rules",
        "application_method.target_rules.values",
        "campaign",
      ],
    },
  );

  const now = new Date();
  const ladders = new Map<string, Tier[]>();
  for (const promotion of promotions) {
    const minQuantity = minQuantityOf(promotion);
    const method = promotion.application_method;
    if (!minQuantity || !method || !promotion.code || !isTier(promotion, now)) continue;
    const key = targetsOf(promotion);
    ladders.set(key, [
      ...(ladders.get(key) ?? []),
      {
        code: promotion.code,
        minQuantity,
        type: method.type as VolumeTier["type"],
        value: Number(method.value),
        currencyCode: method.currency_code ?? null,
      },
    ]);
  }

  return [...ladders.values()]
    .map((tiers) => ({ tiers: tiers.sort((a, b) => a.minQuantity - b.minQuantity) }))
    .sort((a, b) => (a.tiers[0]?.minQuantity ?? 0) - (b.tiers[0]?.minQuantity ?? 0));
}

/** What a ladder shows the shop, without its promotions' codes. */
export const publicLadder = (ladder: Ladder): VolumeLadder => ({
  tiers: ladder.tiers.map(({ code: _code, ...tier }) => tier),
});

type PromotionContext = {
  id: string;
  metadata?: Record<string, unknown> | null;
  items?: { id: string; quantity: number; variant_id?: string | null }[] | null;
  promotions?: ({ code?: string | null } | null)[] | null;
};

async function promotionContextOf(container: MedusaContainer, cartId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "cart",
    fields: PROMOTION_CONTEXT_FIELDS,
    filters: { id: cartId },
  });
  return (data[0] as PromotionContext | undefined) ?? null;
}

/**
 * The items a tier's promotion would discount in the cart, by Medusa's own reading of its
 * conditions and targets: those are the items that count towards it.
 */
async function itemsCountingFor(container: MedusaContainer, code: string, cart: PromotionContext) {
  const promotionModule = container.resolve(Modules.PROMOTION);
  const actions = await promotionModule.computeActions(
    [code],
    // biome-ignore lint/suspicious/noExplicitAny: the cart as Medusa's workflows pass it
    cart as any,
    { prevent_auto_promotions: true },
  );
  const ids = new Set(
    actions.flatMap((action) =>
      action.action === ComputedActions.ADD_ITEM_ADJUSTMENT ? [action.item_id] : [],
    ),
  );
  return (cart.items ?? []).filter((item) => ids.has(item.id));
}

/**
 * Where a cart stands on each ladder, and the tiers it's entitled to: on each ladder, the
 * highest one it reaches. A tier only counts the items its own promotion would discount.
 */
async function standingOf(container: MedusaContainer, cart: PromotionContext) {
  const ladders = await listVolumeLadders(container);
  const standings: VolumeStanding[] = [];
  const entitled: Tier[] = [];

  for (const ladder of ladders) {
    const counts = await Promise.all(
      ladder.tiers.map(async (tier) => {
        const items = await itemsCountingFor(container, tier.code, cart);
        return { tier, items, quantity: items.reduce((sum, item) => sum + item.quantity, 0) };
      }),
    );
    const reached = counts.filter((count) => count.quantity >= count.tier.minQuantity).pop();
    if (reached) entitled.push(reached.tier);
    // The lowest tier's items stand for the ladder's: the items a customer adds to climb it.
    const [lowest] = counts;
    standings.push({
      ...publicLadder(ladder),
      variantIds: [...new Set(lowest?.items.flatMap((item) => item.variant_id ?? []) ?? [])],
      quantity: lowest?.quantity ?? 0,
    });
  }

  const tierCodes = new Set(ladders.flatMap((ladder) => ladder.tiers.map((tier) => tier.code)));
  const applied = (cart.promotions ?? []).flatMap((promotion) =>
    promotion?.code && tierCodes.has(promotion.code) ? [promotion.code] : [],
  );
  return { standings, entitled, applied };
}

/** Where a cart stands on the volume discounts, for the shop; `null` for an unknown cart. */
export async function volumeStandingOf(container: MedusaContainer, cartId: string) {
  const cart = await promotionContextOf(container, cartId);
  return cart ? (await standingOf(container, cart)).standings : null;
}

/** Whether the tiers applied to a cart are the ones it's entitled to, for the checkout. */
export async function volumeDiscountMatches(container: MedusaContainer, cartId: string) {
  const cart = await promotionContextOf(container, cartId);
  if (!cart) return true;
  const { entitled, applied } = await standingOf(container, cart);
  const expected = entitled.map((tier) => tier.code).sort();
  return JSON.stringify(expected) === JSON.stringify([...applied].sort());
}

/**
 * Gives a cart the tiers it's entitled to and takes away the others, then notes them in its
 * metadata, which its order keeps: the order then names its discount as it was. The shop asks
 * for it after every change to the cart, and before placing the order.
 */
export async function syncVolumeDiscount(container: MedusaContainer, cartId: string) {
  const cart = await promotionContextOf(container, cartId);
  if (!cart) return null;
  const { standings, entitled, applied } = await standingOf(container, cart);
  const expected = entitled.map((tier) => tier.code);

  const toRemove = applied.filter((code) => !expected.includes(code));
  const toAdd = expected.filter((code) => !applied.includes(code));
  if (toRemove.length) {
    await updateCartPromotionsWorkflow(container).run({
      input: { cart_id: cartId, promo_codes: toRemove, action: PromotionActions.REMOVE },
    });
  }
  if (toAdd.length) {
    await updateCartPromotionsWorkflow(container).run({
      input: { cart_id: cartId, promo_codes: toAdd, action: PromotionActions.ADD },
    });
  }

  const noted = entitled.map(({ code: _code, ...tier }) => tier);
  if (JSON.stringify(appliedTiers(cart.metadata)) !== JSON.stringify(noted)) {
    const cartModule = container.resolve(Modules.CART);
    await cartModule.updateCarts(cartId, {
      metadata: { ...cart.metadata, [VOLUME_DISCOUNT_KEYS.applied]: noted },
    });
  }
  return standings;
}
