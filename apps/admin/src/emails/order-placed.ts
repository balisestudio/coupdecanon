import { type EmailContent, escapeHtml, formatPrice, layout } from "./layout";

export type OrderPlacedEmail = {
  displayId: number;
  firstName?: string | null;
  currencyCode: string;
  items: { title: string; quantity: number; total: number }[];
  shippingMethod?: string | null;
  total: number;
  taxTotal: number;
};

export function renderOrderPlaced(order: OrderPlacedEmail): EmailContent {
  const title = `Merci pour votre commande n°${order.displayId}`;
  const greeting = order.firstName ? `Bonjour ${order.firstName},` : "Bonjour,";
  const price = (amount: number) => formatPrice(amount, order.currencyCode);

  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0">${item.quantity} × ${escapeHtml(item.title)}</td><td align="right" style="padding:8px 0">${price(item.total)}</td></tr>`,
    )
    .join("");

  const html = layout({
    title,
    body: `<p>${escapeHtml(greeting)}</p>
<p>Nous avons bien reçu votre commande. Nous vous préviendrons par e-mail dès qu'elle sera prête.</p>
<table role="presentation" width="100%" style="border-top:1px solid #ece8df;border-bottom:1px solid #ece8df;margin:24px 0">${rows}</table>
${order.shippingMethod ? `<p>Mode de retrait : ${escapeHtml(order.shippingMethod)}</p>` : ""}
<p style="font-size:17px"><strong>Total : ${price(order.total)}</strong><br><span style="color:#6b6b6b;font-size:13px">dont TVA : ${price(order.taxTotal)}</span></p>`,
  });

  const text = [
    greeting,
    "",
    "Nous avons bien reçu votre commande. Nous vous préviendrons par e-mail dès qu'elle sera prête.",
    "",
    ...order.items.map((item) => `${item.quantity} × ${item.title} : ${price(item.total)}`),
    "",
    ...(order.shippingMethod ? [`Mode de retrait : ${order.shippingMethod}`] : []),
    `Total : ${price(order.total)} (dont TVA : ${price(order.taxTotal)})`,
  ].join("\n");

  return { subject: title, html, text };
}
