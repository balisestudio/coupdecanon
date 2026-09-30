import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { syncProductTypes } from "./catalog";
import { configureCustomers } from "./customers";
import { configureFulfillment } from "./fulfillment";
import { configureReasons } from "./reasons";
import { upsertRegion } from "./region";
import { configureStore, retrieveStore, STORE_NAME } from "./store";
import { configureTaxes } from "./taxes";

/** Configures the store from scratch, or brings it back in line: every step is idempotent. */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const store = await retrieveStore(container);

  const regionId = await upsertRegion(container);
  await configureTaxes(container, await syncProductTypes(container));
  const locationId = await configureFulfillment(container);
  await configureStore(container, store, { regionId, locationId });
  await configureReasons(container);
  await configureCustomers(container);

  logger.info(`Store "${STORE_NAME}" configured`);
}
