import { LEGAL_DOCUMENTS } from "@coupdecanon/config/legal";
import type { CollectionConfig, Field } from "payload";
import { anyone, signedIn } from "../access";
import { legalEditor } from "../editors";

const articleFields: Field[] = [
  {
    type: "row",
    fields: [
      { name: "title", type: "text", label: "Titre", required: true },
      {
        name: "anchor",
        type: "text",
        label: "Ancre",
        required: true,
        admin: {
          description:
            "Pour y mener directement : « order » pour /terms-of-sale#order. En anglais, sans espaces.",
        },
        validate: (value: unknown) =>
          (typeof value === "string" && /^[a-z0-9-]+$/.test(value)) ||
          "Des minuscules, des chiffres et des tirets : « order ».",
      },
    ],
  },
  { name: "content", type: "richText", label: "Texte", required: true, editor: legalEditor },
];

/**
 * A legal document: its date, its preamble, its numbered articles and its appendices. Its
 * texts quote the shop's details from the settings, which keep them up to date. A new date is
 * a new version: the customers' acceptances record it.
 */
export const LegalDocuments: CollectionConfig = {
  slug: "legal-documents",
  labels: { singular: "Document légal", plural: "Documents légaux" },
  admin: { group: "Contenu", useAsTitle: "title", defaultColumns: ["title", "effectiveDate"] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "document",
          type: "select",
          label: "Document",
          required: true,
          unique: true,
          options: Object.entries(LEGAL_DOCUMENTS).map(([value, label]) => ({ value, label })),
        },
        { name: "title", type: "text", label: "Titre", required: true },
        {
          name: "effectiveDate",
          type: "date",
          label: "En vigueur au",
          required: true,
          admin: {
            date: { pickerAppearance: "dayOnly", displayFormat: "d MMMM yyyy" },
            description:
              "Changez-la à chaque modification : c’est la version que les clients acceptent.",
          },
        },
      ],
    },
    { name: "preamble", type: "richText", label: "Préambule", editor: legalEditor },
    {
      name: "articles",
      type: "array",
      label: "Articles",
      labels: { singular: "Article", plural: "Articles" },
      admin: { description: "Numérotés dans l’ordre." },
      fields: articleFields,
    },
    {
      name: "appendices",
      type: "array",
      label: "Annexes",
      labels: { singular: "Annexe", plural: "Annexes" },
      fields: articleFields,
    },
  ],
};
