import { SHOP } from "@coupdecanon/config/shop";
import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { parseShopSettings } from "@coupdecanon/config/shop-settings";
import { readGlobal } from "./cms.server";

/** The issues last reported, so a page view doesn't repeat them. */
let reported = "";

/**
 * The shop's contact details, hours and legal identity, from Payload's "Réglages de la
 * boutique". A part the team hasn't filled in yet is `null`: pages render without it.
 */
export async function getShopInfo(): Promise<ShopInfo> {
  const { issues, ...shop } = parseShopSettings(
    SHOP.name,
    (await readGlobal("settings")) as unknown as Record<string, unknown>,
  );
  const summary = issues.join("\n");
  if (summary && summary !== reported) {
    console.warn(`The shop's settings are incomplete, fill them in Payload:\n${summary}`);
  }
  reported = summary;
  return shop;
}
