import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { CallToAction, Details, EmailLayout, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";
import { storefrontLinks } from "./_components/theme";

export type WelcomeProps = {
  storefrontUrl: string;
  shop: ShopInfo;
  firstName?: string | null;
};

const INTRO =
  "Votre compte est créé. Vous pourrez y suivre vos commandes et commander à nouveau en un geste.";

/** What the account brings. */
const perksOf = (): [string, string][] => [
  [
    "Le retrait au domaine",
    "Commandez en ligne, puis passez chercher votre commande à la boutique du château.",
  ],
  ["La lettre du domaine", "Une lettre quand une cuvée sort de la cave, et rien de plus."],
];

const titleOf = ({ firstName }: WelcomeProps) =>
  firstName ? `Bienvenue au domaine, ${firstName}` : "Bienvenue au domaine";

/** Sent when a customer creates their account. */
export default function Welcome(props: WelcomeProps) {
  return (
    <EmailLayout preview={INTRO} storefrontUrl={props.storefrontUrl} shop={props.shop}>
      <Title>{titleOf(props)}</Title>
      <Paragraph>{INTRO}</Paragraph>
      <Details rows={perksOf()} />
      <CallToAction href={storefrontLinks(props.storefrontUrl).shop}>
        Découvrir la boutique
      </CallToAction>
    </EmailLayout>
  );
}

Welcome.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  firstName: "Camille",
} satisfies WelcomeProps;

export const renderWelcome = (props: WelcomeProps) =>
  renderEmail(
    titleOf(props),
    <Welcome {...props} />,
    [
      INTRO,
      "",
      ...perksOf().map(([label, text]) => `${label} : ${text}`),
      "",
      storefrontLinks(props.storefrontUrl).shop,
    ],
    props.shop,
  );
