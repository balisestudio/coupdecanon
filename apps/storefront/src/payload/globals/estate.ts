import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linkField, paragraphsField, photoField, seoTab, textField, titleField } from "../fields";

/** The estate's page, section by section. */
export const Estate: GlobalConfig = {
  slug: "estate",
  label: "Le domaine",
  admin: { group: "Pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Introduction",
          fields: [titleField(), textField(), photoField("photo", "Photo", "En pleine largeur.")],
        },
        {
          name: "family",
          label: "La famille",
          fields: [
            titleField(),
            paragraphsField(),
            linkField("link", "Lien"),
            photoField("photo", "Photo", "Dans l’arche."),
          ],
        },
        {
          name: "figures",
          label: "En chiffres",
          fields: [{ name: "text", type: "textarea", label: "Texte", required: true }],
        },
        {
          name: "madeHere",
          label: "Fait sur place",
          fields: [
            titleField(),
            textField(),
            {
              name: "workshops",
              type: "array",
              label: "Ateliers",
              labels: { singular: "Atelier", plural: "Ateliers" },
              admin: { description: "Le premier en grand, les suivants à côté." },
              fields: [
                titleField(),
                { name: "text", type: "textarea", label: "Texte", required: true },
                photoField(),
              ],
            },
          ],
        },
        {
          name: "awards",
          label: "Récompenses",
          description: "Les récompenses elles-mêmes sont dans Contenu › Récompenses.",
          fields: [titleField()],
        },
        {
          name: "activities",
          label: "Au domaine aussi",
          fields: [
            titleField(),
            textField(),
            {
              name: "items",
              type: "array",
              label: "Activités",
              labels: { singular: "Activité", plural: "Activités" },
              fields: [
                { name: "name", type: "text", label: "Nom", required: true },
                { name: "text", type: "textarea", label: "Texte", required: true },
                linkField("link", "Lien"),
              ],
            },
          ],
        },
        seoTab(),
      ],
    },
  ],
};
