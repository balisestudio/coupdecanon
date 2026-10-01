import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { seoTab, textField, titleField } from "../fields";

/** The shop's main page: its introduction, and the quote between its families. */
export const Shop: GlobalConfig = {
  slug: "shop",
  label: "La boutique",
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
            textField(
              "Texte",
              "« {produits} » écrit le nombre de produits de la boutique : « 24 produits ».",
            ),
          ],
        },
        {
          name: "quote",
          label: "Citation",
          description:
            "Entre la deuxième et la troisième famille, quand la boutique en a plus de deux.",
          fields: [
            { name: "text", type: "textarea", label: "Citation", required: true },
            { name: "caption", type: "text", label: "Légende" },
          ],
        },
        seoTab({ search: false }),
      ],
    },
  ],
};
