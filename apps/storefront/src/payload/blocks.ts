import type { Block } from "payload";
import { SHOP_VALUES } from "../lib/shop-values";

/**
 * A detail of the shop inside a text, such as its SIREN or its address: the page prints its
 * current value from the settings, so the documents never fall out of date.
 */
export const ShopValueBlock: Block = {
  slug: "shopValue",
  labels: { singular: "Information de la boutique", plural: "Informations de la boutique" },
  admin: {
    components: { Label: "/payload/components/shop-value-label#ShopValueLabel" },
  },
  fields: [
    {
      name: "value",
      type: "select",
      label: "Information",
      required: true,
      options: Object.entries(SHOP_VALUES).map(([value, label]) => ({ value, label })),
      admin: { description: "Tirée des réglages de la boutique." },
    },
  ],
};
