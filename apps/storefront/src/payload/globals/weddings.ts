import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import {
  linkField,
  medusaProductsField,
  photoField,
  seoTab,
  textField,
  titleField,
} from "../fields";

/** The weddings page, section by section; the quote form itself is the site's. */
export const Weddings: GlobalConfig = {
  slug: "weddings",
  label: "Mariages et fêtes",
  admin: { group: "Pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Introduction",
          fields: [
            titleField(),
            textField(),
            {
              name: "ctaLabel",
              type: "text",
              label: "Bouton vers le devis",
              required: true,
            },
            photoField("photo", "Photo", "Dans l’arche."),
          ],
        },
        {
          name: "offer",
          label: "Ce que nous proposons",
          fields: [
            titleField(),
            {
              name: "miniatures",
              type: "group",
              label: "Mignonnettes",
              fields: [
                titleField(),
                textField(
                  "Texte",
                  "« {prix} » écrit le prix du produit ci-dessous, tiré de la boutique : « 1,50€ ». S’il n’est plus en vente, le membre de phrase qui le contient disparaît.",
                ),
                medusaProductsField({ name: "product", label: "Produit" }),
                photoField(),
              ],
            },
            {
              name: "drinks",
              type: "group",
              label: "Boissons",
              fields: [titleField(), textField(), photoField()],
            },
            {
              name: "venue",
              type: "group",
              label: "Lieu de réception",
              fields: [titleField(), textField(), linkField("link", "Lien")],
            },
          ],
        },
        {
          name: "quote",
          label: "Devis",
          description: "Le formulaire, puis le téléphone de la boutique, suivent ce texte.",
          fields: [titleField(), textField()],
        },
        seoTab(),
      ],
    },
  ],
};
