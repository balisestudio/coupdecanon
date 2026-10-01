import { isStrongPassword, PASSWORD_HINT } from "@coupdecanon/config/forms";
import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError, Modules } from "@medusajs/framework/utils";

type ChangePasswordBody = { current_password?: unknown; new_password?: unknown };

/**
 * A signed-in customer changes their password by giving the one they have: no e-mail link
 * needed. A wrong current password is a 400, not a 401, so the customer stays signed in.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<ChangePasswordBody>,
  res: MedusaResponse,
) {
  const { current_password: current, new_password: next } = req.body ?? {};
  if (typeof current !== "string" || !current || typeof next !== "string") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Both passwords are required");
  }
  if (!isStrongPassword(next)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, PASSWORD_HINT);
  }

  const customerModule = req.scope.resolve(Modules.CUSTOMER);
  const authModule = req.scope.resolve(Modules.AUTH);
  const customer = await customerModule.retrieveCustomer(req.auth_context.actor_id);

  const { success } = await authModule.authenticate("emailpass", {
    body: { email: customer.email, password: current },
  });
  if (!success) {
    res.status(400).json({ type: "wrong_password", message: "The current password is wrong" });
    return;
  }

  const updated = await authModule.updateProvider("emailpass", {
    entity_id: customer.email,
    password: next,
  });
  if (!updated.success) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "The password could not be changed");
  }
  res.json({ ok: true });
}
