import { env } from "@coupdecanon/config/env";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { renderPasswordReset } from "../emails/password-reset";
import { sendEmail } from "../emails/send";

type PasswordReset = { entity_id: string; token: string; actor_type: string };

export default async function passwordReset({ event, container }: SubscriberArgs<PasswordReset>) {
  const { entity_id: email, token, actor_type } = event.data;
  const params = new URLSearchParams({ token, email });
  const url =
    actor_type === "user"
      ? `${env.ADMIN_URL}/reset-password?${params}`
      : `${env.STOREFRONT_URL}/reset-password?${params}`;

  await sendEmail(container, {
    to: email,
    template: "password-reset",
    content: renderPasswordReset({ url }),
  });
}

export const config: SubscriberConfig = { event: "auth.password_reset" };
