import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  batchLinksWorkflow,
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingOptionTypesWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  deleteFulfillmentSetsWorkflow,
  updateServiceZonesWorkflow,
  updateShippingOptionsWorkflow,
  updateShippingOptionTypesWorkflow,
  updateShippingProfilesWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows";
import { REGION } from "./region";

const LOCATION = {
  name: "Domaine de Ouézy",
  address: {
    address_1: "22 rue Auguste Lemonnier",
    postal_code: "14270",
    city: "Ouézy",
    country_code: "fr",
  },
};

const FULFILLMENT_PROVIDER_ID = "manual_manual";

const SHIPPING_PROFILE = { name: "Retrait sur place", type: "pickup" };

const SHIPPING_OPTION_TYPE = { label: "Retrait sur place", code: "pickup" };

const SHIPPING_OPTIONS = [
  { name: "Retrait au Domaine de Ouézy", price: 0, is_return: false },
  { name: "Retour au Domaine de Ouézy", price: 0, is_return: true },
];

type ShippingOptionIds = { serviceZoneId: string; shippingProfileId: string; typeId: string };

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

/** Enables pickup and disables shipping at the location, and returns the pickup set's id. */
async function enablePickupOnly(container: MedusaContainer, locationId: string): Promise<string> {
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

/** The pickup zone covers the countries the region sells to. */
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
  if (!created) {
    throw new Error(`Shipping option type "${SHIPPING_OPTION_TYPE.code}" was not created`);
  }
  return created.id;
}

async function upsertShippingOption(
  container: MedusaContainer,
  { name, price, is_return }: (typeof SHIPPING_OPTIONS)[number],
  ids: ShippingOptionIds,
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

/** Sets up pickup at the location, and returns the location's id. */
export async function configureFulfillment(container: MedusaContainer): Promise<string> {
  const locationId = await upsertLocation(container);
  const serviceZoneId = await upsertPickupZone(
    container,
    await enablePickupOnly(container, locationId),
  );
  await linkFulfillmentProvider(container, locationId);

  const ids: ShippingOptionIds = {
    serviceZoneId,
    shippingProfileId: await upsertShippingProfile(container),
    typeId: await upsertShippingOptionType(container),
  };
  for (const option of SHIPPING_OPTIONS) {
    await upsertShippingOption(container, option, ids);
  }

  return locationId;
}
