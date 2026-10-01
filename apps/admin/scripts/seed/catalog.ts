import { CATALOG } from "@coupdecanon/config/shop";
import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  createProductTypesWorkflow,
  deleteProductTypesWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * The product types are tax classes, since Medusa sets a product's VAT rate from its type:
 * alcoholic drinks and other goods at the normal rate, food and soft drinks at the reduced one
 * (see `taxes.ts`). How the shop sorts its products is up to the categories instead.
 */
export const TAX_CLASSES = [
  CATALOG.taxClasses.alcohol,
  CATALOG.taxClasses.food,
  CATALOG.taxClasses.other,
] as const;

export type TaxClass = (typeof TAX_CLASSES)[number];

/**
 * The shop's families, as top-level product categories, in the shop's order. Their handle is
 * their page's address: `/cellar/cidre-poire`. What the site says and shows of each family,
 * its introduction and photo, is Payload's.
 */
export const FAMILIES = [
  {
    name: "Cidre & Poiré",
    handle: "cidre-poire",
  },
  {
    name: "Jus de fruits",
    handle: "jus-de-fruits",
  },
  {
    name: "Calvados & Apéritif",
    handle: "calvados-aperitif",
  },
  {
    name: "Bière",
    handle: "biere",
  },
  {
    name: "Épicerie",
    handle: "epicerie",
  },
  {
    name: "Souvenir",
    handle: "souvenirs",
  },
] as const;

export type FamilyName = (typeof FAMILIES)[number]["name"];

/** Keeps exactly the tax classes above as product types, and returns their ids by value. */
export async function syncTaxClasses(container: MedusaContainer): Promise<Map<TaxClass, string>> {
  const productModule = container.resolve(Modules.PRODUCT);
  const values: readonly string[] = TAX_CLASSES;
  const existing = await productModule.listProductTypes();

  const obsoleteIds = existing
    .filter((type) => !values.includes(type.value))
    .map((type) => type.id);
  if (obsoleteIds.length) {
    await deleteProductTypesWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  const missing = TAX_CLASSES.filter((value) => !existing.some((type) => type.value === value));
  if (missing.length) {
    await createProductTypesWorkflow(container).run({
      input: { product_types: missing.map((value) => ({ value })) },
    });
  }

  const types = await productModule.listProductTypes();
  return new Map(
    types
      .filter((type) => values.includes(type.value))
      .map((type) => [type.value as TaxClass, type.id]),
  );
}

/**
 * Creates the families' categories when missing, public and in the shop's order, and gives an
 * introduction to those without one. A family's category found by name under another handle
 * takes the handle above. Categories the team adds in the admin, and the wording it gives
 * them, stay. Returns the families' category ids by name.
 */
export async function syncFamilies(container: MedusaContainer): Promise<Map<FamilyName, string>> {
  const productModule = container.resolve(Modules.PRODUCT);
  const handles = FAMILIES.map((family) => family.handle);
  const existing = await productModule.listProductCategories({
    $or: [{ handle: handles }, { name: FAMILIES.map((family) => family.name) }],
  });
  const existingOf = (family: (typeof FAMILIES)[number]) =>
    existing.find((category) => category.handle === family.handle) ??
    existing.find((category) => category.name === family.name);

  const missing = FAMILIES.map((family, rank) => ({ ...family, rank })).filter(
    (family) => !existingOf(family),
  );
  if (missing.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((family) => ({
          name: family.name,
          handle: family.handle,
          rank: family.rank,
          is_active: true,
          is_internal: false,
        })),
      },
    });
  }

  // A family found under another handle takes its own.
  for (const family of FAMILIES) {
    const category = existingOf(family);
    if (!category || category.handle === family.handle) continue;
    await updateProductCategoriesWorkflow(container).run({
      input: { selector: { id: category.id }, update: { handle: family.handle } },
    });
  }

  const categories = await productModule.listProductCategories({ handle: handles });
  return new Map(
    FAMILIES.flatMap((family) => {
      const category = categories.find((candidate) => candidate.handle === family.handle);
      return category ? [[family.name, category.id] as const] : [];
    }),
  );
}

/** The ids of the catalog conventions the storefront relies on (see `CATALOG`). */
export type CatalogConventions = { domainOnlyTagId: string };

async function upsertTag(container: MedusaContainer, value: string): Promise<string> {
  const productModule = container.resolve(Modules.PRODUCT);
  const [existing] = await productModule.listProductTags({ value });
  if (existing) return existing.id;

  const { result } = await createProductTagsWorkflow(container).run({
    input: { product_tags: [{ value }] },
  });
  const [created] = result;
  if (!created) throw new Error(`Tag "${value}" was not created`);
  return created.id;
}

/**
 * Creates what the storefront's catalog relies on besides its families, when missing: the
 * "Uniquement au domaine" tag. The team then tags products with it from the admin.
 */
export async function syncCatalogConventions(
  container: MedusaContainer,
): Promise<CatalogConventions> {
  return { domainOnlyTagId: await upsertTag(container, CATALOG.domainOnlyTag) };
}
