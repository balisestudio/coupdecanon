import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  createProductTypesWorkflow,
  deleteProductTypesWorkflow,
} from "@medusajs/medusa/core-flows";

export const PRODUCT_TYPES = [
  "Cidre & Poiré",
  "Jus de fruits",
  "Calvados & Apéritif",
  "Bière",
  "Épicerie",
  "Souvenir",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Keeps exactly the product types above, and returns their ids by value. */
export async function syncProductTypes(
  container: MedusaContainer,
): Promise<Map<ProductType, string>> {
  const productModule = container.resolve(Modules.PRODUCT);
  const values: readonly string[] = PRODUCT_TYPES;
  const existing = await productModule.listProductTypes();

  const obsoleteIds = existing
    .filter((type) => !values.includes(type.value))
    .map((type) => type.id);
  if (obsoleteIds.length) {
    await deleteProductTypesWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  const missing = PRODUCT_TYPES.filter((value) => !existing.some((type) => type.value === value));
  if (missing.length) {
    await createProductTypesWorkflow(container).run({
      input: { product_types: missing.map((value) => ({ value })) },
    });
  }

  const types = await productModule.listProductTypes();
  return new Map(
    types
      .filter((type) => values.includes(type.value))
      .map((type) => [type.value as ProductType, type.id]),
  );
}
