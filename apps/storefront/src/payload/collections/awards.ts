import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";

/** The estate's awards: a line on the home page, in full on the estate's page. */
export const Awards: CollectionConfig = {
  slug: "awards",
  labels: { singular: "Récompense", plural: "Récompenses" },
  admin: { group: "Contenu", useAsTitle: "title", defaultColumns: ["year", "title"] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: "-year",
  fields: [
    {
      type: "row",
      fields: [
        { name: "year", type: "number", label: "Année", required: true },
        { name: "title", type: "text", label: "Titre", required: true },
      ],
    },
    {
      name: "summary",
      type: "text",
      label: "En une ligne",
      required: true,
      admin: { description: "Sur la page d’accueil." },
    },
    {
      name: "detail",
      type: "textarea",
      label: "En détail",
      required: true,
      admin: { description: "Sur la page du domaine." },
    },
  ],
};
