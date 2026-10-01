import { env } from "@coupdecanon/config/env";
import { validateContactMessage } from "@coupdecanon/config/forms";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { renderContactMessageNotice } from "../../../emails/contact-message";
import { sendEmail } from "../../../emails/send";
import { HOUR, overAnyLimit, tooManyRequests } from "../../../lib/rate-limit";
import { retrieveShopInfo } from "../../../lib/shop";

/** A message from the help page's form, sent to the estate to answer by replying. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = validateContactMessage(req.body);
  if (!parsed.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, parsed.error);
  const limited = await overAnyLimit(req.scope, [
    { key: `contact:${parsed.data.email.toLowerCase()}`, limit: 5, windowSeconds: HOUR },
    { key: "contact", limit: 60, windowSeconds: HOUR },
  ]);
  if (limited) return tooManyRequests(res);
  const shop = await retrieveShopInfo(req.scope);

  await sendEmail(req.scope, {
    to: shop.contact?.email ?? env.EMAIL_FROM,
    template: "contact-message-notice",
    content: await renderContactMessageNotice({
      storefrontUrl: env.STOREFRONT_URL,
      shop,
      message: parsed.data,
    }),
    replyTo: parsed.data.email,
  });

  res.status(201).json({ received: true });
}
