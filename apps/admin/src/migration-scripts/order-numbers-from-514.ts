import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/** The shop's first order number: its paper order book ended at 513. */
const FIRST_ORDER_NUMBER = 514;

/**
 * Orders are numbered from 514, as the shop's books continue. Medusa numbers them from a
 * database sequence: it's moved on once, on the first migration, and never moved back past
 * orders already placed.
 */
export default async function orderNumbersFrom514({ container }: { container: MedusaContainer }) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  await pg.raw(
    `select setval(
      pg_get_serial_sequence('"order"', 'display_id'),
      greatest(?, (select coalesce(max(display_id), 0) from "order")),
      true
    )`,
    [FIRST_ORDER_NUMBER - 1],
  );
}
