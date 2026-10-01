import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linksField } from "../fields";

/** The footer of every page: the newsletter, the site map and the health warning. */
export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Pied de page",
  admin: { group: "Sur toutes les pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      name: "newsletter",
      type: "group",
      label: "Lettre du domaine",
      fields: [
        { name: "title", type: "text", label: "Titre", required: true },
        { name: "text", type: "text", label: "Texte" },
        {
          name: "note",
          type: "text",
          label: "Précision",
          admin: { description: "En petit, sous le champ." },
        },
      ],
    },
    {
      name: "columns",
      type: "array",
      label: "Colonnes de liens",
      labels: { singular: "Colonne", plural: "Colonnes" },
      admin: {
        description: "Trois par ligne sur ordinateur. Les documents légaux s’ajoutent tout en bas.",
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", label: "Titre", required: true },
            {
              name: "families",
              type: "checkbox",
              label: "Commencer par les familles de la boutique",
              admin: { style: { alignSelf: "center" } },
            },
          ],
        },
        linksField("links", "Liens"),
      ],
    },
    {
      name: "healthWarning",
      type: "textarea",
      label: "Mention sanitaire",
      required: true,
      admin: { description: "En bas de chaque page." },
    },
  ],
};
