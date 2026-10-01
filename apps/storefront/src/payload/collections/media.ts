import path from "node:path";
import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";

/**
 * The site's photos. Each upload is resized, in WebP, to the widths the pages ask for, so a
 * phone never downloads a desktop's picture; its description is what screen readers say.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo", plural: "Photos" },
  admin: { group: "Contenu", useAsTitle: "alt" },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  upload: {
    // The uploads live beside the app, out of its sources: `apps/storefront/media`.
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    focalPoint: true,
    formatOptions: { format: "webp", options: { quality: 82 } },
    imageSizes: [480, 960, 1440, 2048].map((width) => ({
      name: `w${width}`,
      width,
      formatOptions: { format: "webp", options: { quality: 82 } },
      withoutEnlargement: true,
    })),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Description",
      required: true,
      admin: { description: "Ce que montre la photo, pour qui ne la voit pas." },
    },
  ],
};
