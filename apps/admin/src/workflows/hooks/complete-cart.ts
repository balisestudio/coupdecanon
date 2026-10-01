import { CONSENT_KEY, type Consent } from "@coupdecanon/config/legal";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";
import { volumeDiscountMatches } from "../../lib/volume-discount";

/**
 * A cart becomes an order only once its customer has accepted the terms of sale and read the
 * privacy policy, which the storefront records in the cart's metadata (then the order's), and
 * only with the volume discounts its items are entitled to: a tier code applied by hand, or
 * one the cart no longer reaches, stops the checkout.
 */
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [stored],
  } = await query.graph({ entity: "cart", fields: ["metadata"], filters: { id: cart.id } });
  const consent = stored?.metadata?.[CONSENT_KEY] as Partial<Consent> | undefined;
  if (!consent?.terms_of_sale || !consent.privacy_policy || !consent.accepted_at) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Acceptez les conditions générales de vente et la politique de confidentialité.",
    );
  }

  if (!(await volumeDiscountMatches(container, cart.id))) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "La remise sur volume ne correspond plus au panier : rechargez-le puis réessayez.",
    );
  }
});
