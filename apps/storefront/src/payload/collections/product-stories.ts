import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { medusaProductsField } from "../fields";
import { nameFromMedusa } from "../hooks";

/**
 * A product's story on its page, beside what Medusa holds of it: how it's made, and its steps
 * from the orchard to the glass.
 */
export const ProductStories: CollectionConfig = {
  slug: "product-stories",
  labels: { singular: "Histoire de produit", plural: "Histoires de produits" },
  admin: { group: "Boutique", useAsTitle: "name" },
  hooks: { beforeChange: [nameFromMedusa("products", "product")] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    {
      ...medusaProductsField({ name: "product", label: "Produit", required: true }),
      unique: true,
    },
    {
      name: "name",
      type: "text",
      label: "Nom",
      admin: { readOnly: true, description: "Celui de Medusa, repris à chaque enregistrement." },
    },
    { name: "making", type: "textarea", label: "Élaboration" },
    {
      name: "steps",
      type: "array",
      label: "Du verger au verre",
      labels: { singular: "Étape", plural: "Étapes" },
      fields: [
        { name: "title", type: "text", label: "Titre", required: true },
        { name: "text", type: "textarea", label: "Texte", required: true },
      ],
    },
  ],
};
