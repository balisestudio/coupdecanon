import { env } from "@coupdecanon/config/env";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { sendEmail } from "../emails/send";
import { renderWelcome } from "../emails/welcome";
import { retrieveShopInfo } from "../lib/shop";

/** Welcomes customers who create an account; guests who only order get their order e-mails. */
export default async function customerCreated({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["email", "first_name", "has_account"],
    filters: { id: event.data.id },
  });
  if (!customer?.has_account || !customer.email) return;

  await sendEmail(container, {
    to: customer.email,
    template: "welcome",
    content: await renderWelcome({
      storefrontUrl: env.STOREFRONT_URL,
      shop: await retrieveShopInfo(container),
      firstName: customer.first_name,
    }),
  });
}

export const config: SubscriberConfig = { event: "customer.created" };
