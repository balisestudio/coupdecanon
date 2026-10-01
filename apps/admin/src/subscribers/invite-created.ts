import { env } from "@coupdecanon/config/env";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { renderAdminInvite } from "../emails/admin-invite";
import { sendEmail } from "../emails/send";
import { retrieveShopInfo } from "../lib/shop";

export default async function inviteCreated({ event, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const {
    data: [invite],
  } = await query.graph({
    entity: "invite",
    fields: ["email", "token", "expires_at"],
    filters: { id: event.data.id },
  });
  if (!invite) return;

  await sendEmail(container, {
    to: invite.email,
    template: "admin-invite",
    content: await renderAdminInvite({
      storefrontUrl: env.STOREFRONT_URL,
      shop: await retrieveShopInfo(container),
      url: `${env.ADMIN_URL}/invite?token=${invite.token}`,
      expiresAt: new Date(invite.expires_at),
    }),
  });
}

export const config: SubscriberConfig = { event: ["invite.created", "invite.resent"] };
