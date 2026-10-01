import { env } from "@coupdecanon/config/env";
import { validateQuoteRequest } from "@coupdecanon/config/forms";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import {
  renderQuoteRequestNotice,
  renderQuoteRequestReceived,
} from "../../../emails/quote-request";
import { sendEmail } from "../../../emails/send";
import { HOUR, overAnyLimit, tooManyRequests } from "../../../lib/rate-limit";
import { retrieveShopInfo } from "../../../lib/shop";

/**
 * A wedding or party quote request, from the storefront's form: the estate receives it, to
 * answer by replying, and the visitor a copy of what they asked.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = validateQuoteRequest(req.body);
  if (!parsed.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, parsed.error);
  const request = parsed.data;
  // The visitor gets a copy: an address can't be flooded with them, nor the shop's sending.
  const limited = await overAnyLimit(req.scope, [
    { key: `devis:${request.email.toLowerCase()}`, limit: 3, windowSeconds: HOUR },
    { key: "devis", limit: 60, windowSeconds: HOUR },
  ]);
  if (limited) return tooManyRequests(res);
  const shop = await retrieveShopInfo(req.scope);
  const props = { storefrontUrl: env.STOREFRONT_URL, shop, request };

  await Promise.all([
    sendEmail(req.scope, {
      to: shop.contact?.email ?? env.EMAIL_FROM,
      template: "quote-request-notice",
      content: await renderQuoteRequestNotice(props),
      replyTo: request.email,
    }),
    sendEmail(req.scope, {
      to: request.email,
      template: "quote-request-received",
      content: await renderQuoteRequestReceived(props),
    }),
  ]);

  res.status(201).json({ received: true });
}
