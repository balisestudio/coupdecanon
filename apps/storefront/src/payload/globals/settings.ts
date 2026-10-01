import type { Field, GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";

const DAYS = [
  ["monday", "Lundi"],
  ["tuesday", "Mardi"],
  ["wednesday", "Mercredi"],
  ["thursday", "Jeudi"],
  ["friday", "Vendredi"],
  ["saturday", "Samedi"],
  ["sunday", "Dimanche"],
] as const;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const time = (value: unknown) =>
  typeof value !== "string" || TIME.test(value) || "Une heure comme 09:30.";

/** A day's opening, in up to three spans: a day without one is closed. */
const dayField = ([name, label]: (typeof DAYS)[number]): Field => ({
  name,
  label,
  type: "array",
  maxRows: 3,
  labels: { singular: "Plage", plural: "Plages" },
  fields: [
    {
      type: "row",
      fields: [
        { name: "opens", type: "text", label: "Ouvre à", required: true, validate: time },
        { name: "closes", type: "text", label: "Ferme à", required: true, validate: time },
      ],
    },
  ],
});

/**
 * The shop's details, read by the storefront and by Medusa's e-mails: the contact details, the
 * opening hours, the legal identity, and the host and the mediator the law requires. Field
 * names follow `ShopInfo`, in `@coupdecanon/config/shop-info`.
 */
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Réglages de la boutique",
  admin: { group: "Réglages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Coordonnées",
          fields: [
            {
              name: "contact",
              type: "group",
              label: "Coordonnées",
              admin: { description: "Affichées dans le pied de page, l’aide et les e-mails." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "phone", type: "text", label: "Téléphone", required: true },
                    { name: "email", type: "email", label: "E-mail", required: true },
                  ],
                },
                {
                  name: "address",
                  type: "group",
                  label: "Adresse de la boutique",
                  fields: [
                    {
                      name: "place",
                      type: "text",
                      label: "Lieu",
                      admin: { description: "Facultatif : « Château de Ouézy »." },
                    },
                    { name: "street", type: "text", label: "Rue", required: true },
                    {
                      type: "row",
                      fields: [
                        { name: "postal_code", type: "text", label: "Code postal", required: true },
                        { name: "city", type: "text", label: "Ville", required: true },
                      ],
                    },
                    {
                      type: "row",
                      fields: [
                        { name: "region", type: "text", label: "Région" },
                        {
                          name: "country_code",
                          type: "text",
                          label: "Pays",
                          required: true,
                          defaultValue: "fr",
                          maxLength: 2,
                          admin: { description: "Son code : « fr »." },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Horaires",
          fields: [
            {
              name: "hours",
              type: "group",
              label: "Horaires de la boutique",
              admin: {
                description:
                  "Pour le retrait des commandes : affichés au retrait, sur le site et dans les e-mails. Un jour sans plage est fermé.",
              },
              fields: DAYS.map(dayField),
            },
          ],
        },
        {
          label: "Identité légale",
          fields: [
            {
              name: "legal",
              type: "group",
              label: "Identité légale",
              admin: { description: "Pour les documents légaux et les données structurées." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "legal_name", type: "text", label: "Raison sociale", required: true },
                    { name: "legal_form", type: "text", label: "Forme juridique", required: true },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "siren",
                      type: "text",
                      label: "SIREN",
                      required: true,
                      validate: (value: unknown) =>
                        /^\d{9}$/.test(String(value ?? "").replace(/\s/g, "")) || "9 chiffres.",
                    },
                    {
                      name: "siret",
                      type: "text",
                      label: "SIRET",
                      required: true,
                      validate: (value: unknown) =>
                        /^\d{14}$/.test(String(value ?? "").replace(/\s/g, "")) || "14 chiffres.",
                    },
                  ],
                },
                { name: "address", type: "text", label: "Siège social", required: true },
                {
                  type: "row",
                  fields: [
                    {
                      name: "registration",
                      type: "text",
                      label: "Immatriculation",
                      admin: { description: "« Registre national des entreprises »." },
                    },
                    { name: "vat_number", type: "text", label: "N° de TVA intracommunautaire" },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "share_capital",
                      type: "text",
                      label: "Capital social",
                      admin: { description: "Pour une société seulement." },
                    },
                    {
                      name: "publication_director",
                      type: "text",
                      label: "Directeur de la publication",
                      admin: { description: "Par défaut, la raison sociale." },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Hébergeur et médiateur",
          fields: [
            {
              name: "host",
              type: "group",
              label: "Hébergeur du site",
              admin: { description: "Obligatoire dans les mentions légales." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", label: "Nom" },
                    { name: "phone", type: "text", label: "Téléphone" },
                  ],
                },
                { name: "address", type: "text", label: "Adresse" },
              ],
            },
            {
              name: "mediator",
              type: "group",
              label: "Médiateur de la consommation",
              admin: { description: "Obligatoire dans les conditions générales de vente." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", label: "Nom" },
                    { name: "website", type: "text", label: "Site web" },
                  ],
                },
                { name: "address", type: "text", label: "Adresse" },
              ],
            },
          ],
        },
      ],
    },
  ],
};
