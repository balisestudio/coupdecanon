import { formatEventDate, QUOTE_INTERESTS, type QuoteRequest } from "@coupdecanon/config/forms";
import { phoneToE164, type ShopInfo } from "@coupdecanon/config/shop-info";
import { Aside, CallToAction, Details, EmailLayout, Paragraph, Title } from "./_components/layout";
import { PREVIEW_SHOP } from "./_components/preview";
import { renderEmail } from "./_components/render";

export type QuoteRequestProps = { storefrontUrl: string; shop: ShopInfo; request: QuoteRequest };

/** The request's details, as rows, leaving out what the visitor didn't say. */
function detailsOf(request: QuoteRequest): [string, string][] {
  return [
    ...(request.eventDate
      ? [["Date de l’événement", formatEventDate(request.eventDate)] as [string, string]]
      : []),
    ...(request.guests ? [["Invités", String(request.guests)] as [string, string]] : []),
    ...(request.miniatures
      ? [["Mignonnettes", String(request.miniatures)] as [string, string]]
      : []),
    ...(request.interests.length
      ? [
          [
            "Vous intéresse",
            request.interests.map((interest) => QUOTE_INTERESTS[interest]).join(", "),
          ] as [string, string],
        ]
      : []),
  ];
}

/** The visitor's copy: what they asked for, and how to reach the estate meanwhile. */
function summarizeReceived({ shop, request }: QuoteRequestProps) {
  const firstName = request.name.split(" ")[0];
  return {
    intro: `Bonjour ${firstName}, merci pour votre message. Voici ce que vous nous avez indiqué.`,
    followUp: shop.contact
      ? `Nous revenons vers vous avec une proposition. Pour en parler de vive voix, appelez-nous au ${shop.contact.phone}.`
      : "Nous revenons vers vous avec une proposition.",
  };
}

export default function QuoteRequestReceived(props: QuoteRequestProps) {
  const { intro, followUp } = summarizeReceived(props);
  const details = detailsOf(props.request);
  const { contact } = props.shop;

  return (
    <EmailLayout preview={intro} storefrontUrl={props.storefrontUrl} shop={props.shop}>
      <Title>Nous avons bien reçu votre demande</Title>
      <Paragraph>{intro}</Paragraph>
      {details.length ? <Details rows={details} /> : null}
      <Paragraph>{followUp}</Paragraph>
      {contact ? (
        <CallToAction href={`tel:${phoneToE164(contact.phone)}`}>Appeler le domaine</CallToAction>
      ) : null}
    </EmailLayout>
  );
}

const PREVIEW_REQUEST: QuoteRequest = {
  name: "Camille Martin",
  email: "camille@exemple.fr",
  phone: "06 12 34 56 78",
  eventDate: "2027-06-12",
  guests: 120,
  miniatures: 120,
  interests: ["mignonnettes", "boissons"],
  message: "Un mariage champêtre dans le Pays d’Auge.",
};

QuoteRequestReceived.PreviewProps = {
  storefrontUrl: "http://localhost:8000",
  shop: PREVIEW_SHOP,
  request: PREVIEW_REQUEST,
} satisfies QuoteRequestProps;

export function renderQuoteRequestReceived(props: QuoteRequestProps) {
  const { intro, followUp } = summarizeReceived(props);
  return renderEmail(
    "Nous avons bien reçu votre demande de devis",
    <QuoteRequestReceived {...props} />,
    [
      intro,
      "",
      ...detailsOf(props.request).map(([label, value]) => `${label} : ${value}`),
      "",
      followUp,
    ],
    props.shop,
  );
}

/** The estate's copy: everything the visitor wrote, to answer by replying. */
function noticeRows(request: QuoteRequest): [string, string][] {
  return [
    ["Nom", request.name],
    ["E-mail", request.email],
    ...(request.phone ? [["Téléphone", request.phone] as [string, string]] : []),
    ...detailsOf(request),
  ];
}

export function QuoteRequestNotice(props: QuoteRequestProps) {
  const { request } = props;
  return (
    <EmailLayout
      preview={`Demande de devis de ${request.name}`}
      storefrontUrl={props.storefrontUrl}
      shop={props.shop}
    >
      <Title>Nouvelle demande de devis</Title>
      <Details rows={noticeRows(request)} />
      {request.message ? <Paragraph>{request.message}</Paragraph> : null}
      <Aside>Répondez à cet e-mail pour écrire directement à {request.name}.</Aside>
    </EmailLayout>
  );
}

export const renderQuoteRequestNotice = (props: QuoteRequestProps) =>
  renderEmail(
    `Demande de devis de ${props.request.name}`,
    <QuoteRequestNotice {...props} />,
    [
      ...noticeRows(props.request).map(([label, value]) => `${label} : ${value}`),
      "",
      props.request.message ?? "",
    ],
    props.shop,
  );
