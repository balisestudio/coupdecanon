import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { medusaCategoryField, photoField } from "../fields";
import { nameFromMedusa } from "../hooks";

/**
 * What the site says and shows of a family of products, a category of Medusa's: its photo on
 * the home page, its introduction on its page. Medusa keeps the products and their prices.
 */
export const Families: CollectionConfig = {
  slug: "families",
  labels: { singular: "Famille", plural: "Familles" },
  admin: { group: "Boutique", useAsTitle: "name" },
  hooks: { beforeChange: [nameFromMedusa("categories", "category")] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    medusaCategoryField({ name: "category", label: "Catégorie de la boutique", required: true }),
    {
      name: "name",
      type: "text",
      label: "Nom",
      admin: { readOnly: true, description: "Celui de Medusa, repris à chaque enregistrement." },
    },
    photoField("photo", "Photo"),
    { name: "introduction", type: "textarea", label: "Introduction de sa page" },
  ],
};
