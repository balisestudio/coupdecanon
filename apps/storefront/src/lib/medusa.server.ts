import { env } from "@coupdecanon/config/storefront-env";
import Medusa from "@medusajs/js-sdk";

/** Server-side client for Medusa's store API, scoped to the online sales channel. */
export const medusa = new Medusa({
  baseUrl: env.MEDUSA_BACKEND_URL,
  publishableKey: env.MEDUSA_PUBLISHABLE_KEY,
  debug: env.NODE_ENV === "development",
  // One client serves every visitor: it never keeps a customer's token, which each request
  // passes itself (see `account.ts`).
  auth: { type: "jwt", jwtTokenStorageMethod: "nostore" },
});

export type StoreProduct = Awaited<
  ReturnType<typeof medusa.store.product.list>
>["products"][number];
