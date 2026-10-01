import { validateNewsletter } from "@coupdecanon/config/forms";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";
import { DAY, HOUR, overAnyLimit, tooManyRequests } from "../../../lib/rate-limit";

/**
 * A sign-up to the estate's letter, from the storefront's footer. The letter's readers are
 * customers marked in their metadata, as an account's own setting does: the customer with
 * that address, or a new one without an account.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = validateNewsletter(req.body);
  if (!parsed.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, parsed.error);
  const email = parsed.data.email.toLowerCase();
  const limited = await overAnyLimit(req.scope, [
    { key: `lettre:${email}`, limit: 3, windowSeconds: DAY },
    { key: "lettre", limit: 200, windowSeconds: HOUR },
  ]);
  if (limited) return tooManyRequests(res);

  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const customers = await customerModule.listCustomers({ email });
  const subscription = { newsletter: true, newsletter_since: new Date().toISOString() };

  if (customers.length) {
    // Each keeps its other metadata.
    for (const customer of customers) {
      if (customer.metadata?.newsletter === true) continue;
      await customerModule.updateCustomers(customer.id, {
        metadata: { ...customer.metadata, ...subscription },
      });
    }
  } else {
    await createCustomersWorkflow(req.scope).run({
      input: { customersData: [{ email, has_account: false, metadata: subscription }] },
    });
  }

  res.status(201).json({ subscribed: true });
}
