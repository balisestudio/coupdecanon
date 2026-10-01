import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";

/** The search page: the searches it suggests. The pages it finds are set on each page. */
export const Search: GlobalConfig = {
  slug: "search",
  label: "Recherche",
  admin: {
    group: "Pages",
    description:
      "Les pages que trouve la recherche, à côté des produits, se règlent dans l’onglet Référencement de chacune.",
  },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      name: "suggestions",
      type: "array",
      label: "Recherches suggérées",
      labels: { singular: "Recherche", plural: "Recherches" },
      admin: { description: "Proposées sous le champ, avant que le visiteur écrive." },
      fields: [{ name: "term", type: "text", label: "Recherche", required: true }],
    },
  ],
};
