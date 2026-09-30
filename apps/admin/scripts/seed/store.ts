import type { MedusaContainer, StoreDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
  linkSalesChannelsToStockLocationWorkflow,
  updateApiKeysWorkflow,
  updateSalesChannelsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { REGION } from "./region";

export const STORE_NAME = "Coup de Canon";

const SALES_CHANNEL = { name: "Boutique en ligne", description: null };

const PUBLISHABLE_API_KEY_TITLE = "Boutique en ligne";

/** The seller's identity, from the French business register, for invoices and legal notices. */
const LEGAL = {
  legal_name: "Hervé Delom de Mézerac",
  legal_form: "Entrepreneur individuel (EI)",
  siren: "410727150",
  siret: "41072715000014",
  address: "Avenue du Château de Canon, 14270 Mézidon Vallée d'Auge",
};

async function configureSalesChannel(
  container: MedusaContainer,
  salesChannelId: string,
  locationId: string,
) {
  await updateSalesChannelsWorkflow(container).run({
    input: { selector: { id: salesChannelId }, update: SALES_CHANNEL },
  });
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: locationId, add: [salesChannelId] },
  });
}

/** Medusa creates the storefront's publishable key on its first start. */
async function renamePublishableApiKey(container: MedusaContainer) {
  await updateApiKeysWorkflow(container).run({
    input: { selector: { type: "publishable" }, update: { title: PUBLISHABLE_API_KEY_TITLE } },
  });
}

export async function configureStore(
  container: MedusaContainer,
  store: StoreDTO,
  { regionId, locationId }: { regionId: string; locationId: string },
) {
  if (!store.default_sales_channel_id) throw new Error("The store has no default sales channel");

  await configureSalesChannel(container, store.default_sales_channel_id, locationId);
  await renamePublishableApiKey(container);

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: STORE_NAME,
        // Prices entered in the admin include VAT, like the region's.
        supported_currencies: [
          { currency_code: REGION.currency_code, is_default: true, is_tax_inclusive: true },
        ],
        supported_locales: [{ locale_code: "fr-FR" }],
        default_region_id: regionId,
        default_location_id: locationId,
        metadata: { ...store.metadata, legal: LEGAL },
      },
    },
  });
}

export async function retrieveStore(container: MedusaContainer): Promise<StoreDTO> {
  const storeModule = container.resolve(Modules.STORE);
  const [store] = await storeModule.listStores();
  if (!store) throw new Error("No store found: run the migrations first");
  return store;
}
