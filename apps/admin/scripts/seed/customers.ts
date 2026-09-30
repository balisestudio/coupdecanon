import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  createCustomerGroupsWorkflow,
  createPriceListsWorkflow,
  updatePriceListsWorkflow,
} from "@medusajs/medusa/core-flows";

const PROFESSIONALS_GROUP = "Professionnels";

const PROFESSIONAL_PRICE_LIST = {
  title: "Tarifs professionnels",
  description: "Prix réservés aux clients du groupe « Professionnels »",
};

async function upsertProfessionalsGroup(container: MedusaContainer): Promise<string> {
  const customerModule = container.resolve(Modules.CUSTOMER);
  const [existing] = await customerModule.listCustomerGroups({ name: PROFESSIONALS_GROUP });
  if (existing) return existing.id;

  const { result } = await createCustomerGroupsWorkflow(container).run({
    input: { customersData: [{ name: PROFESSIONALS_GROUP }] },
  });
  const [created] = result;
  if (!created) throw new Error(`Customer group "${PROFESSIONALS_GROUP}" was not created`);
  return created.id;
}

/** The price list starts empty: prices are set per product in the admin. */
async function upsertProfessionalPriceList(container: MedusaContainer, groupId: string) {
  const pricingModule = container.resolve(Modules.PRICING);
  const priceList = {
    ...PROFESSIONAL_PRICE_LIST,
    status: "active" as const,
    rules: { "customer.groups.id": [groupId] },
  };

  const existing = (await pricingModule.listPriceLists()).find(
    ({ title }) => title === priceList.title,
  );

  if (existing) {
    await updatePriceListsWorkflow(container).run({
      input: { price_lists_data: [{ ...priceList, id: existing.id }] },
    });
  } else {
    await createPriceListsWorkflow(container).run({
      input: { price_lists_data: [{ ...priceList, prices: [] }] },
    });
  }
}

export async function configureCustomers(container: MedusaContainer) {
  const groupId = await upsertProfessionalsGroup(container);
  await upsertProfessionalPriceList(container, groupId);
}
