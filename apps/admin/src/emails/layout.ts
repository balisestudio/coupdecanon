export type EmailContent = { subject: string; html: string; text: string };

export const BRAND = "Coup de Canon";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

export const formatPrice = (amount: number, currencyCode: string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: currencyCode }).format(amount);

export const button = (label: string, url: string) =>
  `<p style="margin:32px 0"><a href="${escapeHtml(url)}" style="background:#1f3a2b;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">${escapeHtml(label)}</a></p>`;

/** Wraps an e-mail body, already escaped, in the brand's layout. */
export function layout({ title, body }: { title: string; body: string }): string {
  return `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;background:#f5f3ee;font-family:Helvetica,Arial,sans-serif;color:#1c1c1c">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px">
          <tr><td style="padding:24px 32px;border-bottom:1px solid #ece8df;font-size:20px;font-weight:700;color:#1f3a2b">${BRAND}</td></tr>
          <tr><td style="padding:32px;font-size:15px;line-height:1.6">
            <h1 style="margin:0 0 16px;font-size:22px">${escapeHtml(title)}</h1>
            ${body}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
