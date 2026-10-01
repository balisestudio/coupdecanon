import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import {
  linkField,
  medusaProductsField,
  paragraphsField,
  photoField,
  seoTab,
  textField,
  titleField,
} from "../fields";

/** The home page, section by section. */
export const Home: GlobalConfig = {
  slug: "home",
  label: "Accueil",
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
            linkField("cta", "Bouton"),
            {
              type: "row",
              fields: [
                photoField("photoStart", "Photo de gauche"),
                photoField("photo", "Photo centrale", "Dans l’arche."),
                photoField("photoEnd", "Photo de droite"),
              ],
            },
          ],
        },
        {
          name: "cellar",
          label: "Produits mis en avant",
          fields: [
            titleField(),
            medusaProductsField({
              name: "products",
              label: "Produits",
              hasMany: true,
              description:
                "Dans cet ordre, autant qu’il en faut. La boutique les montre aussi en premier, triée par « Nos préférés », et le panier les propose. Sans aucun, l’accueil montre les trois derniers produits.",
            }),
          ],
        },
        {
          name: "estate",
          label: "Le domaine",
          fields: [
            {
              name: "title",
              type: "textarea",
              label: "Titre",
              required: true,
              admin: { rows: 2, description: "Un retour à la ligne coupe le titre à cet endroit." },
            },
            paragraphsField(),
            photoField("photo", "Photo", "Dans l’arche."),
          ],
        },
        {
          name: "orchard",
          label: "Le verger",
          description: "Les variétés listées sont celles de la page Le verger.",
          fields: [titleField(), textField(), linkField("link", "Lien")],
        },
        {
          name: "families",
          label: "Familles",
          description:
            "Une carte par famille de la boutique, dans l’ordre de Medusa ; leurs photos sont dans Boutique › Familles.",
          fields: [titleField()],
        },
        {
          name: "miniatures",
          label: "Mignonnettes",
          fields: [
            titleField(),
            textField(),
            {
              name: "facts",
              type: "array",
              label: "Chiffres",
              labels: { singular: "Chiffre", plural: "Chiffres" },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "text", label: "Valeur", required: true },
                    { name: "label", type: "text", label: "Légende", required: true },
                  ],
                },
              ],
            },
            linkField("cta", "Bouton"),
          ],
        },
        {
          name: "awards",
          label: "Récompenses",
          description: "Les récompenses elles-mêmes sont dans Contenu › Récompenses.",
          fields: [titleField()],
        },
        seoTab({ search: false }),
      ],
    },
  ],
};
