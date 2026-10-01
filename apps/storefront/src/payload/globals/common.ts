import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { photoField } from "../fields";

/** The sections several pages share: coming to the estate, and the age check. */
export const Common: GlobalConfig = {
  slug: "common",
  label: "Sections communes",
  admin: { group: "Sur toutes les pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "visit",
          label: "Venir au domaine",
          description:
            "Sur l’accueil et la page du domaine. L’adresse, le téléphone et les horaires viennent des réglages de la boutique.",
          fields: [
            { name: "title", type: "text", label: "Titre", required: true },
            photoField("photo", "Photo"),
          ],
        },
        {
          name: "ageGate",
          label: "Contrôle de l’âge",
          description: "La fenêtre qui demande l’âge des visiteurs à leur arrivée.",
          fields: [
            { name: "title", type: "text", label: "Titre", required: true },
            { name: "text", type: "textarea", label: "Texte", required: true },
            {
              name: "healthWarning",
              type: "textarea",
              label: "Mention sanitaire",
              required: true,
            },
            photoField("photo", "Photo"),
          ],
        },
      ],
    },
  ],
};
