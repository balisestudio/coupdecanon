import { env } from "@coupdecanon/config/env";
import { SHOP } from "@coupdecanon/config/shop";
import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { parseShopSettings } from "@coupdecanon/config/shop-settings";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/** The shop's details change rarely: they're read again after this long. */
const CACHE_TTL_MS = 5 * 60_000;

let cache: { value: ShopInfo; expiresAt: number } | null = null;

const NONE: ShopInfo = {
  name: SHOP.name,
  contact: null,
  legal: null,
  host: null,
  mediator: null,
  hours: null,
};

/**
 * The shop's name, contact details, hours and legal identity, for the e-mails: the team keeps
 * them in Payload's "Réglages de la boutique", which the storefront serves at
 * `/api/globals/settings`. When it can't be reached, e-mails go out with the details last read,
 * or without them.
 */
export async function retrieveShopInfo(container: MedusaContainer): Promise<ShopInfo> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  try {
    const response = await fetch(new URL("/api/globals/settings?depth=0", env.STOREFRONT_URL), {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { issues, ...shop } = parseShopSettings(SHOP.name, await response.json());
    if (issues.length) {
      logger.warn(
        `The shop's settings are incomplete, fill them in Payload:\n${issues.join("\n")}`,
      );
    }
    cache = { value: shop, expiresAt: Date.now() + CACHE_TTL_MS };
    return shop;
  } catch (error) {
    logger.error(`The shop's settings could not be read from Payload: ${String(error)}`);
    return cache?.value ?? NONE;
  }
}
