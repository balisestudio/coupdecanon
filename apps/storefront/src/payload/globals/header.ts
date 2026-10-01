import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linksField } from "../fields";

/** The header of every page: the announcement above it, and its menus. */
export const Header: GlobalConfig = {
  slug: "header",
  label: "En-tête",
  admin: { group: "Sur toutes les pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      name: "announcement",
      type: "text",
      label: "Bandeau d’annonce",
      maxLength: 120,
      admin: {
        description:
          "La ligne au-dessus de l’en-tête : une remise en cours, une fermeture exceptionnelle. Vide, le bandeau disparaît.",
      },
    },
    linksField(
      "main",
      "Menu de l’en-tête",
      "Sur ordinateur, à gauche du logo ; la recherche, le compte et le panier sont à droite.",
    ),
    linksField(
      "menu",
      "Menu du téléphone",
      "Dans le menu qui s’ouvre sur téléphone, sous la recherche.",
    ),
  ],
};
