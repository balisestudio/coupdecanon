import { CONTACT_SUBJECTS, type ContactMessage } from "@coupdecanon/config/forms";
import type { ShopInfo } from "@coupdecanon/config/shop-info";
import { Aside, Details, EmailLayout, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";

export type ContactMessageProps = {
  storefrontUrl: string;
  shop: ShopInfo;
  message: ContactMessage;
};

const rowsOf = (message: ContactMessage): [string, string][] => [
  ["Nom", message.name],
  ["E-mail", message.email],
  ["Sujet", CONTACT_SUBJECTS[message.subject]],
];

/** A visitor's message from the help page, for the estate to answer by replying. */
export default function ContactMessageNotice({
  storefrontUrl,
  shop,
  message,
}: ContactMessageProps) {
  return (
    <EmailLayout preview={`Message de ${message.name}`} storefrontUrl={storefrontUrl} shop={shop}>
      <Title>Nouveau message</Title>
      <Details rows={rowsOf(message)} />
      <Paragraph>{message.message}</Paragraph>
      <Aside>Répondez à cet e-mail pour écrire directement à {message.name}.</Aside>
    </EmailLayout>
  );
}

ContactMessageNotice.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  message: {
    name: "Camille Martin",
    email: "camille@exemple.fr",
    subject: "visite",
    message: "Bonjour, la boutique est-elle ouverte le dimanche ?",
  },
} satisfies ContactMessageProps;

export const renderContactMessageNotice = (props: ContactMessageProps) =>
  renderEmail(
    `${CONTACT_SUBJECTS[props.message.subject]}, message de ${props.message.name}`,
    <ContactMessageNotice {...props} />,
    [
      ...rowsOf(props.message).map(([label, value]) => `${label} : ${value}`),
      "",
      props.message.message,
    ],
    props.shop,
  );
