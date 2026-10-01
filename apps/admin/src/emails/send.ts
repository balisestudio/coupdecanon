import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import type { EmailContent } from "./_components/render";

export async function sendEmail(
  container: MedusaContainer,
  {
    to,
    template,
    content,
    replyTo,
  }: { to: string; template: string; content: EmailContent; replyTo?: string },
) {
  const notificationModule = container.resolve(Modules.NOTIFICATION);
  await notificationModule.createNotifications({
    to,
    channel: "email",
    template,
    content,
    ...(replyTo ? { data: { reply_to: replyTo } } : {}),
  });
}
