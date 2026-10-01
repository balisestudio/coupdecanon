import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { linkField, photoField, textField, titleField } from "../fields";

/** The page that confirms an order: its photo, and what to do on the day of the pickup. */
export const OrderConfirmation: GlobalConfig = {
  slug: "order-confirmation",
  label: "Commande confirmée",
  admin: {
    group: "Pages",
    description: "Le remerciement et le récapitulatif de la commande sont écrits par le site.",
  },
  access: { read: anyone, update: signedIn },
  fields: [
    photoField("photo", "Photo", "Dans l’arche, à côté du remerciement."),
    {
      name: "pickupDay",
      type: "group",
      label: "Le jour du retrait",
      fields: [titleField(), textField(), linkField("link", "Lien")],
    },
  ],
};
