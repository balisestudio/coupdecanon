import { type EmailContent, escapeHtml, layout } from "./layout";

export type OrderReadyForPickupEmail = {
  displayId: number;
  firstName?: string | null;
  location: { name: string; address: string };
};

export function renderOrderReadyForPickup(order: OrderReadyForPickupEmail): EmailContent {
  const title = `Votre commande n°${order.displayId} est prête`;
  const greeting = order.firstName ? `Bonjour ${order.firstName},` : "Bonjour,";

  const html = layout({
    title,
    body: `<p>${escapeHtml(greeting)}</p>
<p>Votre commande vous attend. Vous pouvez venir la retirer à l'adresse suivante :</p>
<p style="padding:16px;background:#f5f3ee;border-radius:6px"><strong>${escapeHtml(order.location.name)}</strong><br>${escapeHtml(order.location.address)}</p>
<p>Pensez à vous munir de votre numéro de commande : <strong>n°${order.displayId}</strong>.</p>`,
  });

  const text = [
    greeting,
    "",
    "Votre commande vous attend. Vous pouvez venir la retirer à l'adresse suivante :",
    order.location.name,
    order.location.address,
    "",
    `Pensez à vous munir de votre numéro de commande : n°${order.displayId}.`,
  ].join("\n");

  return { subject: title, html, text };
}
