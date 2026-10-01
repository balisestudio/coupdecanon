import { medusa } from "../lib/medusa.server";

/**
 * What the admin picks from Medusa: the shop's products, and its families, the top-level
 * product categories. Only what the online shop sells shows, as its store API lists it.
 */
export type MedusaResource = "products" | "categories";

export const isMedusaResource = (value: unknown): value is MedusaResource =>
  value === "products" || value === "categories";

export type MedusaOption = { value: string; label: string };

/** More than the estate will ever sell: one request lists everything. */
const LIMIT = 200;

/** The products or the families, by name, for a select. */
export async function medusaOptions(resource: MedusaResource): Promise<MedusaOption[]> {
  if (resource === "products") {
    const { products } = await medusa.store.product.list({
      fields: "id,title",
      order: "title",
      limit: LIMIT,
    });
    return products.map((product) => ({ value: product.id, label: product.title }));
  }
  const { product_categories: categories } = await medusa.store.category.list({
    parent_category_id: "null",
    fields: "id,name",
    order: "rank",
    limit: LIMIT,
  });
  return categories.map((category) => ({ value: category.id, label: category.name }));
}

/** The name Medusa gives a product or a family, or `null` for one it doesn't know. */
export async function medusaLabel(resource: MedusaResource, id: string) {
  const options = await medusaOptions(resource);
  return options.find((option) => option.value === id)?.label ?? null;
}
