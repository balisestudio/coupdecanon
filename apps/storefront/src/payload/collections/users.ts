import type { CollectionConfig } from "payload";

/** The team members who edit the site, signed in to its admin. */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Utilisateur", plural: "Utilisateurs" },
  admin: { useAsTitle: "email", group: "Réglages" },
  auth: true,
  fields: [{ name: "name", type: "text", label: "Nom" }],
};
