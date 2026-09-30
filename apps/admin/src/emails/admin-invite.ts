import { BRAND, button, type EmailContent, layout } from "./layout";

export function renderAdminInvite({ url }: { url: string }): EmailContent {
  const title = `Invitation à rejoindre l'administration ${BRAND}`;

  const html = layout({
    title,
    body: `<p>Bonjour,</p>
<p>Vous avez été invité(e) à gérer la boutique ${BRAND}. Cliquez sur le bouton ci-dessous pour créer votre compte.</p>
${button("Créer mon compte", url)}
<p style="color:#6b6b6b;font-size:13px">Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.</p>`,
  });

  const text = [
    "Bonjour,",
    "",
    `Vous avez été invité(e) à gérer la boutique ${BRAND}. Créez votre compte ici :`,
    url,
    "",
    "Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.",
  ].join("\n");

  return { subject: title, html, text };
}
