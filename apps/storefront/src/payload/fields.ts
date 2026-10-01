import type { Field, GroupField, Tab, TextField } from "payload";

/**
 * Field builders shared by the site's content. The team edits in French, so every label is
 * French; field names stay in English, for the code that reads them.
 */

/** A section's title. */
export const titleField = (label = "Titre"): Field => ({
  name: "title",
  type: "text",
  label,
  required: true,
});

/** A short text under a title. */
export const textField = (label = "Texte", description?: string): Field => ({
  name: "text",
  type: "textarea",
  label,
  ...(description ? { admin: { description } } : {}),
});

/** Paragraphs of plain text, one after the other. */
export const paragraphsField = (name = "paragraphs", label = "Paragraphes"): Field => ({
  name,
  label,
  type: "array",
  labels: { singular: "Paragraphe", plural: "Paragraphes" },
  fields: [{ name: "text", type: "textarea", label: "Texte", required: true }],
});

/** A photo from the media library. */
export const photoField = (name = "photo", label = "Photo", description?: string): Field => ({
  name,
  label,
  type: "upload",
  relationTo: "media",
  ...(description ? { admin: { description } } : {}),
});

/** Where a link may lead: a page of the site, an anchor, another site, a phone or an e-mail. */
const LINK_URL = /^(\/|#|https?:\/\/|mailto:|tel:)/;

const urlField = (required: boolean): TextField => ({
  name: "url",
  type: "text",
  label: "Adresse",
  required,
  validate: (value: unknown) =>
    (!required && !value) ||
    (typeof value === "string" && LINK_URL.test(value)) ||
    "Une page du site, « /the-estate », ou une adresse complète, « https://… ».",
  admin: { description: "« /the-estate » sur le site, ou « https://… » ailleurs." },
});

/** A link the team writes: its words and where it leads, on the site or elsewhere. */
export const linkField = (
  name: string,
  label: string,
  { required = true, description }: { required?: boolean; description?: string } = {},
): GroupField => ({
  name,
  label,
  type: "group",
  ...(description ? { admin: { description } } : {}),
  fields: [
    {
      type: "row",
      fields: [{ name: "label", type: "text", label: "Libellé", required }, urlField(required)],
    },
  ],
});

/** The links of a menu, each with a shorter label for phones if needed. */
export const linksField = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "array",
  labels: { singular: "Lien", plural: "Liens" },
  ...(description ? { admin: { description } } : {}),
  fields: [
    {
      type: "row",
      fields: [
        { name: "label", type: "text", label: "Libellé", required: true },
        urlField(true),
        {
          name: "shortLabel",
          type: "text",
          label: "Libellé court",
          admin: { description: "Sur téléphone, si le libellé est long." },
        },
      ],
    },
  ],
});

/** A page's referencing: what search engines and shared links show. */
export const seoField = (): Field => ({
  name: "seo",
  type: "group",
  label: "Référencement",
  admin: { description: "Ce que montrent les moteurs de recherche et les liens partagés." },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Titre",
      required: true,
      maxLength: 70,
      admin: { description: "Le nom de la boutique s’y ajoute : « … – Coup de Canon »." },
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: true,
      maxLength: 200,
    },
  ],
});

/** What the site's search finds of a page, beside its products. */
export const searchField = (): Field => ({
  name: "search",
  type: "group",
  label: "Recherche du site",
  admin: { description: "Comment la page apparaît dans la recherche du site." },
  fields: [
    { name: "summary", type: "text", label: "Résumé", required: true },
    {
      name: "keywords",
      type: "text",
      label: "Mots qui la trouvent",
      admin: { description: "Séparés par des espaces : « verger pomme poire »." },
    },
  ],
});

/** A page's last tab: its referencing, and how the site's search finds it. */
export const seoTab = ({ search = true }: { search?: boolean } = {}): Tab => ({
  label: "Référencement",
  fields: search ? [seoField(), searchField()] : [seoField()],
});

/**
 * A pick among Medusa's products, from a list the shop's catalog fills in: the team chooses by
 * name, never types an id. The products' ids are stored, in the order chosen.
 */
export const medusaProductsField = ({
  name,
  label,
  hasMany = false,
  required = false,
  description,
}: {
  name: string;
  label: string;
  hasMany?: boolean;
  required?: boolean;
  description?: string;
}): TextField =>
  ({
    name,
    label,
    type: "text",
    hasMany,
    required,
    admin: {
      ...(description ? { description } : {}),
      components: {
        Field: {
          path: "/payload/components/medusa-select#MedusaSelect",
          clientProps: { resource: "products" },
        },
      },
    },
  }) as TextField;

/** A pick among Medusa's product categories, the shop's families, from Medusa's list. */
export const medusaCategoryField = ({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}): TextField => ({
  name,
  label,
  type: "text",
  required,
  unique: true,
  admin: {
    components: {
      Field: {
        path: "/payload/components/medusa-select#MedusaSelect",
        clientProps: { resource: "categories" },
      },
    },
  },
});
