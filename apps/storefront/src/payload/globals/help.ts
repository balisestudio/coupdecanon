import type { GlobalConfig } from "payload";
import { anyone, signedIn } from "../access";
import { seoTab, textField, titleField } from "../fields";

/** The help page: the questions asked most often, and the contact form's title. */
export const Help: GlobalConfig = {
  slug: "help",
  label: "Aide et contact",
  admin: { group: "Pages" },
  access: { read: anyone, update: signedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Introduction",
          fields: [titleField(), textField()],
        },
        {
          label: "Questions",
          fields: [
            {
              name: "questions",
              type: "array",
              label: "Questions fréquentes",
              labels: { singular: "Question", plural: "Questions" },
              admin: { description: "La première est ouverte à l’arrivée sur la page." },
              fields: [
                { name: "question", type: "text", label: "Question", required: true },
                { name: "answer", type: "textarea", label: "Réponse", required: true },
                {
                  name: "anchor",
                  type: "text",
                  label: "Ancre",
                  admin: {
                    description:
                      "Pour y mener directement : « pickup » ouvre cette question depuis /help#pickup, comme le lien « Livraison et retrait ». En anglais, sans espaces.",
                  },
                  validate: (value: unknown) =>
                    !value ||
                    (typeof value === "string" && /^[a-z0-9-]+$/.test(value)) ||
                    "Des minuscules, des chiffres et des tirets : « pickup ».",
                },
              ],
            },
          ],
        },
        {
          name: "contact",
          label: "Nous écrire",
          description: "Le formulaire et les coordonnées de la boutique suivent ce titre.",
          fields: [titleField()],
        },
        seoTab(),
      ],
    },
  ],
};
