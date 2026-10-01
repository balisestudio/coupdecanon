import type { LexicalInlineBlockLabelServerProps } from "@payloadcms/richtext-lexical";
import { isShopValueKey, SHOP_VALUES } from "../../lib/shop-values";

/** An inserted detail, in the editor, under its own name: "SIREN", "Adresse de la boutique". */
export function ShopValueLabel({ formState, data }: LexicalInlineBlockLabelServerProps) {
  const value = formState?.value?.value ?? (data as { value?: unknown } | undefined)?.value;
  return <span>{isShopValueKey(value) ? SHOP_VALUES[value] : "Information de la boutique"}</span>;
}
