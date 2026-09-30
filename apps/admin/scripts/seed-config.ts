import type { ExecArgs, MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  batchLinksWorkflow,
  createLocationFulfillmentSetWorkflow,
  createProductTypesWorkflow,
  createRefundReasonsWorkflow,
  createRegionsWorkflow,
  createReturnReasonsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingOptionTypesWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  deleteFulfillmentSetsWorkflow,
  deleteProductTypesWorkflow,
  deleteRefundReasonsWorkflow,
  deleteReturnReasonsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRefundReasonsWorkflow,
  updateRegionsWorkflow,
  updateReturnReasonsWorkflow,
  updateSalesChannelsWorkflow,
  updateServiceZonesWorkflow,
  updateShippingOptionsWorkflow,
  updateShippingOptionTypesWorkflow,
  updateShippingProfilesWorkflow,
  updateStockLocationsWorkflow,
  updateStoresWorkflow,
  updateTaxRatesWorkflow,
} from "@medusajs/medusa/core-flows";

const STORE_NAME = "Coup de Canon";

const SALES_CHANNEL = { name: "Boutique en ligne", description: null };

const SHIPPING_PROFILE = { name: "Retrait sur place", type: "pickup" };

const SHIPPING_OPTION_TYPE = { label: "Retrait sur place", code: "pickup" };

const FULFILLMENT_PROVIDER_ID = "manual_manual";

const SHIPPING_OPTIONS = [
  { name: "Retrait au Domaine de Ouézy", price: 0, is_return: false },
  { name: "Retour au Domaine de Ouézy", price: 0, is_return: true },
];

const REGION = {
  name: "France",
  currency_code: "eur",
  countries: ["fr"],
  automatic_taxes: true,
  is_tax_inclusive: true,
  payment_providers: ["pp_stripe_stripe", "pp_system_default"],
};

const LOCATION = {
  name: "Domaine de Ouézy",
  address: {
    address_1: "Domaine de Ouézy",
    postal_code: "14270",
    city: "Ouézy",
    country_code: "fr",
  },
};

const PRODUCT_TYPES = [
  "Cidre & Poiré",
  "Jus de fruits",
  "Calvados & Apéritif",
  "Bière",
  "Épicerie",
  "Souvenir",
];

const REFUND_REASONS = [
  {
    code: "customer_care_adjustment",
    label: "Geste commercial",
    description: "Remboursement accordé en compensation d'un désagrément",
  },
  {
    code: "pricing_error",
    label: "Erreur de prix",
    description: "Remboursement pour corriger un trop-perçu, une remise oubliée ou un prix erroné",
  },
  {
    code: "withdrawal",
    label: "Rétractation",
    description: "Remboursement suite à l'exercice du droit de rétractation de 14 jours",
  },
  {
    code: "defective_product",
    label: "Produit défectueux ou non conforme",
    description: "Remboursement au titre de la garantie légale de conformité",
  },
  {
    code: "out_of_stock",
    label: "Produit indisponible",
    description: "Remboursement d'un produit en rupture de stock après la commande",
  },
];

const RETURN_REASONS = [
  {
    value: "withdrawal",
    label: "Rétractation",
    description: "Le client exerce son droit de rétractation de 14 jours",
  },
  {
    value: "defective",
    label: "Produit défectueux",
    description: "Le produit présente un défaut ou ne fonctionne pas",
  },
  {
    value: "not_as_described",
    label: "Produit non conforme à la description",
    description: "Le produit ne correspond pas à sa description sur la boutique",
  },
  {
    value: "wrong_item",
    label: "Erreur de préparation",
    description: "Le produit remis au client n'est pas celui commandé",
  },
];

const TAX_REGION = { country_code: "fr", provider_id: "tp_system" };

const TAX_RATES = [
  { code: "FR_NORMAL", name: "Taux normal", rate: 20, is_default: true },
  { code: "FR_INTERMEDIATE", name: "Taux intermédiaire", rate: 10, is_default: false },
  { code: "FR_REDUCED", name: "Taux réduit", rate: 5.5, is_default: false },
];

async function upsertRegion(container: MedusaContainer): Promise<string> {
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

async function upsertLocation(container: MedusaContainer): Promise<string> {
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const [existing] = await stockLocationModule.listStockLocations({ name: LOCATION.name });

  if (existing) {
    await updateStockLocationsWorkflow(container).run({
      input: { selector: { id: existing.id }, update: LOCATION },
    });
    return existing.id;
  }

  const { result } = await createStockLocationsWorkflow(container).run({
    input: { locations: [LOCATION] },
  });
  const [created] = result;
  if (!created) throw new Error(`Location "${LOCATION.name}" was not created`);
  return created.id;
}

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

async function upsertShippingProfile(container: MedusaContainer): Promise<string> {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const [named] = await fulfillmentModule.listShippingProfiles({ name: SHIPPING_PROFILE.name });
  // The profile Medusa creates on its first migration, before this seed renames it.
  const [medusaDefault] = named
    ? []
    : await fulfillmentModule.listShippingProfiles({ type: "default" });
  const existing = named ?? medusaDefault;

  if (existing) {
    await updateShippingProfilesWorkflow(container).run({
      input: { selector: { id: existing.id }, update: SHIPPING_PROFILE },
    });
    return existing.id;
  }

  const { result } = await createShippingProfilesWorkflow(container).run({
    input: { data: [SHIPPING_PROFILE] },
  });
  const [created] = result;
  if (!created) throw new Error(`Shipping profile "${SHIPPING_PROFILE.name}" was not created`);
  return created.id;
}

async function upsertShippingOptionType(container: MedusaContainer): Promise<string> {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const [existing] = await fulfillmentModule.listShippingOptionTypes({
    code: SHIPPING_OPTION_TYPE.code,
  });

  if (existing) {
    await updateShippingOptionTypesWorkflow(container).run({
      input: { selector: { id: existing.id }, update: SHIPPING_OPTION_TYPE },
    });
    return existing.id;
  }

  const { result } = await createShippingOptionTypesWorkflow(container).run({
    input: { shipping_option_types: [SHIPPING_OPTION_TYPE] },
  });
  const [created] = result;
  if (!created)
    throw new Error(`Shipping option type "${SHIPPING_OPTION_TYPE.code}" was not created`);
  return created.id;
}

async function listFulfillmentSets(container: MedusaContainer, locationId: string) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [location],
  } = await query.graph({
    entity: "stock_location",
    fields: ["fulfillment_sets.id", "fulfillment_sets.type"],
    filters: { id: locationId },
  });
  return (location?.fulfillment_sets ?? []).filter((set) => set !== null);
}

async function configureFulfillment(container: MedusaContainer, locationId: string) {
  const fulfillmentSets = await listFulfillmentSets(container, locationId);

  const shippingIds = fulfillmentSets.filter((set) => set.type === "shipping").map((set) => set.id);
  if (shippingIds.length) {
    await deleteFulfillmentSetsWorkflow(container).run({ input: { ids: shippingIds } });
  }

  if (!fulfillmentSets.some((set) => set.type === "pickup")) {
    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: locationId,
        fulfillment_set_data: { name: `${LOCATION.name} pick up`, type: "pickup" },
      },
    });
  }

  const pickup = (await listFulfillmentSets(container, locationId)).find(
    (set) => set.type === "pickup",
  );
  if (!pickup) throw new Error(`Pickup was not enabled for "${LOCATION.name}"`);
  return pickup.id;
}

async function upsertPickupZone(
  container: MedusaContainer,
  fulfillmentSetId: string,
): Promise<string> {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const zone = {
    name: REGION.name,
    geo_zones: REGION.countries.map((country_code) => ({ type: "country" as const, country_code })),
  };

  const [existing] = await fulfillmentModule.listServiceZones({
    fulfillment_set: { id: fulfillmentSetId },
    name: zone.name,
  });

  if (existing) {
    await updateServiceZonesWorkflow(container).run({
      input: { selector: { id: existing.id }, update: zone },
    });
    return existing.id;
  }

  const { result } = await createServiceZonesWorkflow(container).run({
    input: { data: [{ ...zone, fulfillment_set_id: fulfillmentSetId }] },
  });
  const [created] = result;
  if (!created) throw new Error(`Service zone "${zone.name}" was not created`);
  return created.id;
}

async function linkFulfillmentProvider(container: MedusaContainer, locationId: string) {
  await batchLinksWorkflow(container).run({
    input: {
      create: [
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
          [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
        },
      ],
    },
  });
}

async function upsertShippingOption(
  container: MedusaContainer,
  { name, price, is_return }: (typeof SHIPPING_OPTIONS)[number],
  ids: { serviceZoneId: string; shippingProfileId: string; typeId: string },
) {
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const option = {
    name,
    price_type: "flat" as const,
    provider_id: FULFILLMENT_PROVIDER_ID,
    service_zone_id: ids.serviceZoneId,
    shipping_profile_id: ids.shippingProfileId,
    type_id: ids.typeId,
    data: { id: is_return ? "manual-fulfillment-return" : "manual-fulfillment" },
    prices: [{ currency_code: REGION.currency_code, amount: price }],
    rules: [
      { attribute: "is_return", operator: "eq" as const, value: String(is_return) },
      { attribute: "enabled_in_store", operator: "eq" as const, value: "true" },
    ],
  };

  const [existing] = await fulfillmentModule.listShippingOptions({
    service_zone: { id: ids.serviceZoneId },
    name,
  });

  if (existing) {
    await updateShippingOptionsWorkflow(container).run({ input: [{ ...option, id: existing.id }] });
  } else {
    await createShippingOptionsWorkflow(container).run({ input: [option] });
  }
}

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

async function upsertTaxRates(container: MedusaContainer, taxRegionId: string) {
  const taxModule = container.resolve(Modules.TAX);

  for (const rate of TAX_RATES) {
    const [existing] = await taxModule.listTaxRates({
      tax_region_id: taxRegionId,
      code: rate.code,
    });

    if (existing) {
      await updateTaxRatesWorkflow(container).run({
        input: { selector: { id: existing.id }, update: rate },
      });
    } else {
      await createTaxRatesWorkflow(container).run({
        input: [{ ...rate, tax_region_id: taxRegionId }],
      });
    }
  }
}

async function syncProductTypes(container: MedusaContainer) {
  const productModule = container.resolve(Modules.PRODUCT);
  const existing = await productModule.listProductTypes();

  const obsoleteIds = existing
    .filter((type) => !PRODUCT_TYPES.includes(type.value))
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
}

async function syncRefundReasons(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: existing } = await query.graph({
    entity: "refund_reason",
    fields: ["id", "code"],
  });
  const codes = new Set(REFUND_REASONS.map((reason) => reason.code));

  const obsoleteIds = existing
    .filter((reason) => !codes.has(reason.code))
    .map((reason) => reason.id);
  if (obsoleteIds.length) {
    await deleteRefundReasonsWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  for (const reason of REFUND_REASONS) {
    const current = existing.find(({ code }) => code === reason.code);
    if (current) {
      await updateRefundReasonsWorkflow(container).run({ input: [{ ...reason, id: current.id }] });
    } else {
      await createRefundReasonsWorkflow(container).run({ input: { data: [reason] } });
    }
  }
}

async function syncReturnReasons(container: MedusaContainer) {
  const orderModule = container.resolve(Modules.ORDER);
  const existing = await orderModule.listReturnReasons({});
  const values = new Set(RETURN_REASONS.map((reason) => reason.value));

  const obsoleteIds = existing
    .filter((reason) => !values.has(reason.value))
    .map((reason) => reason.id);
  if (obsoleteIds.length) {
    await deleteReturnReasonsWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  for (const reason of RETURN_REASONS) {
    const current = existing.find(({ value }) => value === reason.value);
    if (current) {
      await updateReturnReasonsWorkflow(container).run({
        input: { selector: { id: current.id }, update: reason },
      });
    } else {
      await createReturnReasonsWorkflow(container).run({ input: { data: [reason] } });
    }
  }
}

export default async function seedConfig({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModule = container.resolve(Modules.STORE);

  const [store] = await storeModule.listStores();
  if (!store) throw new Error("No store found: run the migrations first");
  if (!store.default_sales_channel_id) throw new Error("The store has no default sales channel");

  const regionId = await upsertRegion(container);
  const locationId = await upsertLocation(container);
  const serviceZoneId = await upsertPickupZone(
    container,
    await configureFulfillment(container, locationId),
  );
  await configureSalesChannel(container, store.default_sales_channel_id, locationId);
  await linkFulfillmentProvider(container, locationId);
  const shippingOptionIds = {
    serviceZoneId,
    shippingProfileId: await upsertShippingProfile(container),
    typeId: await upsertShippingOptionType(container),
  };
  for (const option of SHIPPING_OPTIONS) {
    await upsertShippingOption(container, option, shippingOptionIds);
  }
  await upsertTaxRates(container, await upsertTaxRegion(container));
  await syncProductTypes(container);
  await syncRefundReasons(container);
  await syncReturnReasons(container);

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: STORE_NAME,
        default_region_id: regionId,
        default_location_id: locationId,
      },
    },
  });

  logger.info(`Store "${STORE_NAME}" configured with the "${REGION.name}" region`);
}
