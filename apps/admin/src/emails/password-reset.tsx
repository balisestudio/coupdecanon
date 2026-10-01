import { PATHS } from "@coupdecanon/config/routes";
import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { CallToAction, EmailLayout, Note, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";

/** Medusa's reset tokens expire after 15 minutes (`generateResetPasswordTokenWorkflow`). */
const VALIDITY = "15 minutes";

const INTRO =
  "Bonjour, vous avez demandé à changer votre mot de passe. Choisissez-en un nouveau avec le bouton ci-dessous.";
const WARNING = `Ce lien est valable ${VALIDITY}. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe actuel reste valable.`;

export type PasswordResetProps = { storefrontUrl: string; shop: ShopInfo; url: string };

export default function PasswordReset({ storefrontUrl, shop, url }: PasswordResetProps) {
  return (
    <EmailLayout preview={INTRO} storefrontUrl={storefrontUrl} shop={shop} airy>
      <Title>Un nouveau mot de passe</Title>
      <Paragraph>{INTRO}</Paragraph>
      <CallToAction href={url}>Choisir un mot de passe</CallToAction>
      <Note>{WARNING}</Note>
    </EmailLayout>
  );
}

PasswordReset.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  url: `http://localhost:8000${PATHS.resetPassword}?token=preview`,
} satisfies PasswordResetProps;

export const renderPasswordReset = (props: PasswordResetProps) =>
  renderEmail(
    "Choisissez un nouveau mot de passe",
    <PasswordReset {...props} />,
    [INTRO, "", props.url, "", WARNING],
    props.shop,
  );
