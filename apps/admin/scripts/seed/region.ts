import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createRegionsWorkflow, updateRegionsWorkflow } from "@medusajs/medusa/core-flows";

export const REGION = {
  name: "France",
  currency_code: "eur",
  countries: ["fr"],
  automatic_taxes: true,
  is_tax_inclusive: true,
  payment_providers: ["pp_stripe_stripe", "pp_system_default"],
};

export async function upsertRegion(container: MedusaContainer): Promise<string> {
  const regionModule = container.resolve(Modules.REGION);
  const [existing] = await regionModule.listRegions({ name: REGION.name });

  if (existing) {
    await updateRegionsWorkflow(container).run({
      input: { selector: { id: existing.id }, update: REGION },
    });
    return existing.id;
  }

  const { result } = await createRegionsWorkflow(container).run({
    input: { regions: [REGION] },
  });
  const [created] = result;
  if (!created) throw new Error(`Region "${REGION.name}" was not created`);
  return created.id;
}
