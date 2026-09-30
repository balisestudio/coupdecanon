import { BRAND, button, type EmailContent, layout } from "./layout";

export function renderPasswordReset({ url }: { url: string }): EmailContent {
  const title = "Réinitialisation de votre mot de passe";

  const html = layout({
    title,
    body: `<p>Bonjour,</p>
<p>Vous avez demandé à réinitialiser votre mot de passe ${BRAND}. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
${button("Choisir un nouveau mot de passe", url)}
<p style="color:#6b6b6b;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.</p>`,
  });

  const text = [
    "Bonjour,",
    "",
    `Vous avez demandé à réinitialiser votre mot de passe ${BRAND}. Choisissez-en un nouveau ici :`,
    url,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.",
  ].join("\n");

  return { subject: title, html, text };
}
