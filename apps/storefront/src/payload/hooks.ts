import type { CollectionBeforeChangeHook } from "payload";
import { type MedusaResource, medusaLabel } from "./medusa";

/**
 * Names a document after the Medusa product or family it's about, so the admin's lists read
 * "Calvados fermier" rather than an id. Medusa's name may change: each save takes it again.
 */
export const nameFromMedusa =
  (resource: MedusaResource, field: string): CollectionBeforeChangeHook =>
  async ({ data, originalDoc, req }) => {
    const id = data[field] ?? originalDoc?.[field];
    if (typeof id !== "string" || !id) return data;
    try {
      const label = await medusaLabel(resource, id);
      return { ...data, name: label ?? data.name ?? originalDoc?.name ?? id };
    } catch (error) {
      req.payload.logger.warn({ err: error, msg: "Medusa's name could not be read" });
      return { ...data, name: data.name ?? originalDoc?.name ?? id };
    }
  };
