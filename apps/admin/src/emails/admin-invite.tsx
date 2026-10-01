import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { CallToAction, EmailLayout, Note, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";
import { BRAND, formatDateTime } from "./_components/theme";

const INTRO = `Bonjour, vous êtes invité(e) à gérer la boutique ${BRAND}. Créez votre compte avec le bouton ci-dessous.`;

const warning = (expiresAt: Date) =>
  `Cette invitation expire le ${formatDateTime(expiresAt)}. Si vous ne l’attendiez pas, ignorez cet e-mail.`;

export type AdminInviteProps = {
  storefrontUrl: string;
  shop: ShopInfo;
  url: string;
  expiresAt: Date;
};

export default function AdminInvite({ storefrontUrl, shop, url, expiresAt }: AdminInviteProps) {
  return (
    <EmailLayout preview={INTRO} storefrontUrl={storefrontUrl} shop={shop} airy>
      <Title>Rejoindre l’administration</Title>
      <Paragraph>{INTRO}</Paragraph>
      <CallToAction href={url}>Créer mon compte</CallToAction>
      <Note>{warning(expiresAt)}</Note>
    </EmailLayout>
  );
}

AdminInvite.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  url: "http://localhost:9000/app/invite?token=preview",
  expiresAt: new Date("2026-10-01T14:30:00+02:00"),
} satisfies AdminInviteProps;

export const renderAdminInvite = (props: AdminInviteProps) =>
  renderEmail(
    `Invitation à rejoindre l’administration ${BRAND}`,
    <AdminInvite {...props} />,
    [INTRO, "", props.url, "", warning(props.expiresAt)],
    props.shop,
  );
