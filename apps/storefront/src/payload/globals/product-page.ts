import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linkField, photoField, textField, titleField } from "../fields";

/**
 * What every product's page shows beside the product: the titles of its story, the
 * information common to every product, and the invitation to taste at the shop.
 */
export const ProductPage: GlobalConfig = {
  slug: "product-page",
  label: "Fiche produit",
  admin: {
    group: "Pages",
    description:
      "Ce qui est propre à un produit est dans Medusa, ou dans Boutique › Histoires de produits.",
  },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "story",
          label: "Histoire du produit",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "makingTitle",
                  type: "text",
                  label: "Titre de l’élaboration",
                  required: true,
                },
                { name: "stepsTitle", type: "text", label: "Titre des étapes", required: true },
              ],
            },
          ],
        },
        {
          name: "details",
          label: "Informations",
          description: "Sous chaque produit, après son élaboration.",
          fields: [
            {
              name: "items",
              type: "array",
              label: "Informations",
              labels: { singular: "Information", plural: "Informations" },
              fields: [
                titleField(),
                { name: "text", type: "textarea", label: "Texte", required: true },
                linkField("link", "Lien", { required: false }),
              ],
            },
          ],
        },
        {
          name: "tasting",
          label: "Dégustation",
          description: "L’adresse et le téléphone viennent des réglages de la boutique.",
          fields: [titleField(), textField(), photoField()],
        },
        {
          name: "related",
          label: "Même famille",
          fields: [titleField()],
        },
      ],
    },
  ],
};
