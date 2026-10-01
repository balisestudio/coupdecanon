import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linkField, paragraphsField, photoField, seoTab, textField, titleField } from "../fields";

/** The orchard's page, section by section. */
export const Orchard: GlobalConfig = {
  slug: "orchard",
  label: "Le verger",
  admin: { group: "Pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Introduction",
          fields: [titleField(), textField(), photoField("photo", "Photo", "Dans l’arche.")],
        },
        {
          name: "apples",
          label: "Les pommes",
          fields: [
            titleField(),
            textField(),
            {
              name: "varieties",
              type: "array",
              label: "Variétés",
              labels: { singular: "Variété", plural: "Variétés" },
              admin: { description: "Aussi sur l’accueil." },
              fields: [{ name: "name", type: "text", label: "Nom", required: true }],
            },
          ],
        },
        {
          name: "pears",
          label: "Les poires",
          fields: [titleField(), paragraphsField(), linkField("link", "Lien"), photoField()],
        },
        {
          name: "harvest",
          label: "La récolte",
          fields: [
            titleField(),
            {
              name: "steps",
              type: "array",
              label: "Étapes",
              labels: { singular: "Étape", plural: "Étapes" },
              fields: [
                titleField(),
                { name: "text", type: "textarea", label: "Texte", required: true },
              ],
            },
          ],
        },
        {
          name: "additives",
          label: "Sans ajout",
          fields: [titleField(), textField()],
        },
        {
          name: "animals",
          label: "Les animaux",
          fields: [titleField(), paragraphsField(), linkField("link", "Lien"), photoField()],
        },
        {
          name: "taste",
          label: "Goûter le verger",
          fields: [titleField(), linkField("cta", "Bouton")],
        },
        seoTab(),
      ],
    },
  ],
};
