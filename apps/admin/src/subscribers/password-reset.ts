import { env } from "@coupdecanon/config/env";
import { PATHS } from "@coupdecanon/config/routes";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { renderPasswordReset } from "../emails/password-reset";
import { sendEmail } from "../emails/send";
import { retrieveShopInfo } from "../lib/shop";

type PasswordReset = { entity_id: string; token: string; actor_type: string };

export default async function passwordReset({ event, container }: SubscriberArgs<PasswordReset>) {
  const { entity_id: email, token, actor_type } = event.data;
  const params = new URLSearchParams({ token, email });
  const url =
    actor_type === "user"
      ? `${env.ADMIN_URL}/reset-password?${params}`
      : `${env.STOREFRONT_URL}${PATHS.resetPassword}?${params}`;

  await sendEmail(container, {
    to: email,
    template: "password-reset",
    content: await renderPasswordReset({
      storefrontUrl: env.STOREFRONT_URL,
      shop: await retrieveShopInfo(container),
      url,
    }),
  });
}

export const config: SubscriberConfig = { event: "auth.password_reset" };
