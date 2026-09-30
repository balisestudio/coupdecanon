import type { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import type { EmailContent } from "./layout";

export async function sendEmail(
  container: MedusaContainer,
  { to, template, content }: { to: string; template: string; content: EmailContent },
) {
  const notificationModule = container.resolve(Modules.NOTIFICATION);
  await notificationModule.createNotifications({ to, channel: "email", template, content });
}
