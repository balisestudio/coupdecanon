import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  updateTaxRatesWorkflow,
} from "@medusajs/medusa/core-flows";
import type { ProductType } from "./catalog";

const TAX_REGION = { country_code: "fr", provider_id: "tp_system" };

/** The default rate applies to every product type no other rate lists. */
const TAX_RATES: {
  code: string;
  name: string;
  rate: number;
  is_default: boolean;
  productTypes: ProductType[];
}[] = [
  { code: "FR_NORMAL", name: "Taux normal", rate: 20, is_default: true, productTypes: [] },
  {
    code: "FR_INTERMEDIATE",
    name: "Taux intermédiaire",
    rate: 10,
    is_default: false,
    productTypes: [],
  },
  {
    code: "FR_REDUCED",
    name: "Taux réduit",
    rate: 5.5,
    is_default: false,
    productTypes: ["Jus de fruits", "Épicerie"],
  },
];

async function upsertTaxRegion(container: MedusaContainer): Promise<string> {
  const taxModule = container.resolve(Modules.TAX);
  const taxRegions = await taxModule.listTaxRegions({ country_code: TAX_REGION.country_code });
  const existing = taxRegions.find((taxRegion) => !taxRegion.parent_id);
  if (existing) return existing.id;

  const { result } = await createTaxRegionsWorkflow(container).run({ input: [TAX_REGION] });
  const [created] = result;
  if (!created) throw new Error(`Tax region "${TAX_REGION.country_code}" was not created`);
  return created.id;
}

export async function configureTaxes(
  container: MedusaContainer,
  productTypeIds: Map<ProductType, string>,
) {
  const taxModule = container.resolve(Modules.TAX);
  const taxRegionId = await upsertTaxRegion(container);

  for (const { productTypes, ...rate } of TAX_RATES) {
    const rules = productTypes.map((type) => {
      const id = productTypeIds.get(type);
      if (!id) throw new Error(`Product type "${type}" does not exist`);
      return { reference: "product_type", reference_id: id };
    });
    const [existing] = await taxModule.listTaxRates({
      tax_region_id: taxRegionId,
      code: rate.code,
    });

    if (existing) {
      await updateTaxRatesWorkflow(container).run({
        input: { selector: { id: existing.id }, update: { ...rate, rules } },
      });
    } else {
      await createTaxRatesWorkflow(container).run({
        input: [{ ...rate, rules, tax_region_id: taxRegionId }],
      });
    }
  }
}
