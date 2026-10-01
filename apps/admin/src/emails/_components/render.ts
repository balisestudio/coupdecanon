import { formatAddress, type ShopInfo } from "@coupdecanon/config/shop-info";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { BRAND, TAGLINE } from "./theme";

const signature = ({ contact }: ShopInfo) =>
  [
    `${BRAND}, ${TAGLINE}`,
    ...(contact ? [formatAddress(contact.address), `${contact.phone}, ${contact.email}`] : []),
    "",
    "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
  ].join("\n");

export type EmailContent = { subject: string; html: string; text: string };

/**
 * Renders an e-mail to HTML. Its plain-text version, for clients that don't show HTML, is
 * written by hand: the one derived from the HTML runs table cells together.
 */
export async function renderEmail(
  subject: string,
  email: ReactElement,
  textLines: string[],
  shop: ShopInfo,
): Promise<EmailContent> {
  return {
    subject,
    html: await render(email),
    text: [...textLines, "", signature(shop)].join("\n"),
  };
}
