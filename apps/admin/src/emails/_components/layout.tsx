import { formatAddress, type ShopInfo } from "@coupdecanon/config/shop-info";
import type { CSSProperties, ReactNode } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";
import {
  BRAND,
  COLOR,
  emailAssets,
  logoWidth,
  SANS,
  SERIF,
  SERIF_WEIGHT,
  storefrontLinks,
  TAGLINE,
  TEXT,
} from "./theme";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap";

/**
 * The storefront's serif, from the storefront itself: Google Fonts doesn't have it. Without
 * quotes, which React would escape inside `<style>`.
 */
const serifFace = (url: string) => `
  @font-face {
    font-family: CdC Serif;
    src: url(${url}) format(woff2);
    font-weight: 500;
    font-style: normal;
  }
`;

/** Titles and names, set like the storefront's. */
const serif: CSSProperties = { fontFamily: SERIF, fontWeight: SERIF_WEIGHT };

/** The logo's height in the header, as on the storefront's (56px), and in the footer. */
const LOGO_HEIGHT = 56;
const FOOTER_LOGO_HEIGHT = 48;

/** Phones get the mockups' mobile layout: the page goes edge to edge, with 20px gutters. */
const RESPONSIVE = `
  @media (max-width: 620px) {
    .shell { padding: 0 !important; }
    .header { padding: 24px 20px !important; }
    .content { padding: 24px 20px !important; }
    .footer { padding: 40px 20px !important; }
    .title { font-size: ${TEXT["3xl"].fontSize}px !important; }
    .panel { padding: 24px 20px !important; }
    .button { display: block !important; box-sizing: border-box !important; width: 100% !important; text-align: center !important; }
    .footer-links { font-size: ${TEXT.sm.fontSize}px !important; line-height: 2.4 !important; }
  }
`;

/** Every block ends with this margin, which the content's bottom padding accounts for. */
const GAP = 24;

const ruled: CSSProperties = { borderBottom: `1px solid ${COLOR.rule}` };

/** `airy` gives short messages, like a lone call to action, the mockups' extra padding. */
export function EmailLayout({
  preview,
  storefrontUrl,
  shop,
  airy = false,
  children,
}: {
  preview: string;
  storefrontUrl: string;
  /** The shop's details, from the store's metadata: its footer prints the contact ones. */
  shop: ShopInfo;
  airy?: boolean;
  children: ReactNode;
}) {
  const links = storefrontLinks(storefrontUrl);
  const assets = emailAssets(storefrontUrl);

  return (
    <Html lang="fr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <link rel="stylesheet" href={FONTS_URL} />
        <style>{serifFace(assets.serif) + RESPONSIVE}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: COLOR.stone }}>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: COLOR.stone }}
        >
          <tbody>
            <tr>
              <td align="center" className="shell" style={{ padding: "40px 16px" }}>
                <Container
                  style={{
                    maxWidth: 600,
                    width: "100%",
                    backgroundColor: COLOR.cream,
                    fontFamily: SANS,
                    color: COLOR.forest,
                  }}
                >
                  <Row>
                    <Column
                      align="center"
                      className="header"
                      style={{ ...ruled, padding: "40px 48px" }}
                    >
                      <Link href={links.home} style={{ display: "inline-block" }}>
                        <Img
                          src={assets.logo}
                          alt={BRAND}
                          width={logoWidth(LOGO_HEIGHT)}
                          height={LOGO_HEIGHT}
                          style={{ display: "block" }}
                        />
                      </Link>
                    </Column>
                  </Row>
                  <Row>
                    <Column
                      className="content"
                      style={{
                        padding: airy ? `56px 48px ${64 - GAP}px` : `48px 48px ${56 - GAP}px`,
                      }}
                    >
                      {children}
                    </Column>
                  </Row>
                  <Footer links={links} logo={assets.logoOnForest} shop={shop} />
                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}

function Footer({
  links,
  logo,
  shop,
}: {
  links: ReturnType<typeof storefrontLinks>;
  logo: string;
  shop: ShopInfo;
}) {
  const { contact } = shop;
  const footerLink = (label: string, href: string) => (
    <Link href={href} style={{ color: COLOR.cream, textDecoration: "underline" }}>
      {label}
    </Link>
  );
  const spacer = <span>&nbsp;&nbsp;&nbsp;&nbsp; </span>;
  const small: CSSProperties = { margin: 0, ...TEXT.xs };

  return (
    <Row>
      <Column
        className="footer"
        style={{ padding: "40px 48px", backgroundColor: COLOR.forest, color: COLOR.cream }}
      >
        <Img
          src={logo}
          alt={BRAND}
          width={logoWidth(FOOTER_LOGO_HEIGHT)}
          height={FOOTER_LOGO_HEIGHT}
          style={{ display: "block", margin: "0 0 24px" }}
        />
        <Text style={{ ...small, margin: "0 0 16px", color: COLOR.mist }}>
          {TAGLINE}
          {contact ? (
            <>
              <br />
              {formatAddress(contact.address)}
              <br />
              {contact.phone},{" "}
              <Link href={`mailto:${contact.email}`} style={{ color: COLOR.mist }}>
                {contact.email}
              </Link>
            </>
          ) : null}
        </Text>
        <Text className="footer-links" style={{ ...small, margin: "0 0 24px" }}>
          {footerLink("La boutique", links.shop)}
          {spacer}
          {footerLink("Le domaine", links.estate)}
          {spacer}
          {footerLink("Mon compte", links.account)}
          {spacer}
          {footerLink("Aide", links.help)}
        </Text>
        <Text
          style={{
            ...small,
            paddingTop: 16,
            borderTop: `1px solid ${COLOR.ruleOnForest}`,
            color: COLOR.mist,
          }}
        >
          Cet e-mail vous est envoyé à la suite d’une action sur la boutique du domaine.
          <br />
          L’abus d’alcool est dangereux pour la santé, à consommer avec modération.
        </Text>
      </Column>
    </Row>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      className="title"
      style={{
        margin: `0 0 ${GAP}px`,
        ...serif,
        ...TEXT["4xl"],
        color: COLOR.forest,
      }}
    >
      {children}
    </Heading>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h2"
      style={{
        margin: `0 0 ${GAP}px`,
        paddingTop: GAP,
        ...serif,
        ...TEXT["2xl"],
        color: COLOR.forest,
      }}
    >
      {children}
    </Heading>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: `0 0 ${GAP}px`, ...TEXT.base, color: COLOR.forest }}>{children}</Text>
  );
}

/** A secondary remark. */
export function Aside({ children }: { children: ReactNode }) {
  return <Text style={{ margin: `0 0 ${GAP}px`, ...TEXT.sm, color: COLOR.sage }}>{children}</Text>;
}

/** A closing remark, set apart by a rule. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: `0 0 ${GAP}px`,
        paddingTop: GAP,
        borderTop: `1px solid ${COLOR.rule}`,
        ...TEXT.sm,
        color: COLOR.sage,
      }}
    >
      {children}
    </Text>
  );
}

/** A 48px pill: a 24px line between 12px paddings. */
export function CallToAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: `0 0 ${GAP}px` }}>
      <Button
        href={href}
        className="button"
        style={{
          padding: "12px 32px",
          borderRadius: 999,
          backgroundColor: COLOR.forest,
          color: COLOR.cream,
          fontFamily: SANS,
          fontSize: TEXT.sm.fontSize,
          lineHeight: "24px",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Label and value rows. */
export function Details({ rows }: { rows: [label: string, value: ReactNode][] }) {
  const cell: CSSProperties = { ...ruled, padding: "16px 0", ...TEXT.sm };

  return (
    <Section style={{ margin: `0 0 ${GAP}px`, borderTop: `1px solid ${COLOR.rule}` }}>
      {rows.map(([label, value]) => (
        <Row key={label}>
          <Column
            width={140}
            valign="top"
            style={{ ...cell, width: 140, paddingRight: 24, color: COLOR.sage }}
          >
            {label}
          </Column>
          <Column valign="top" style={cell}>
            {value}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

/** A tinted box. */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section style={{ margin: `16px 0 ${GAP}px` }}>
      <Row>
        <Column className="panel" style={{ padding: "24px 32px", backgroundColor: COLOR.stone }}>
          <Text
            style={{
              margin: "0 0 8px",
              ...serif,
              ...TEXT.xl,
              color: COLOR.forest,
            }}
          >
            {title}
          </Text>
          <Text style={{ margin: 0, ...TEXT.sm, color: COLOR.forest }}>{children}</Text>
        </Column>
      </Row>
    </Section>
  );
}

export type LineItem = {
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: string;
};

export function LineItems({ items }: { items: LineItem[] }) {
  return (
    <Section style={{ margin: `0 0 ${GAP}px`, borderTop: `1px solid ${COLOR.rule}` }}>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: two order lines can look identical
        <Row key={index}>
          <Column width={64} style={{ ...ruled, width: 48, padding: "16px 16px 16px 0" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td
                    width={48}
                    height={60}
                    align="center"
                    valign="bottom"
                    style={{ width: 48, height: 60, backgroundColor: COLOR.stone }}
                  >
                    {item.thumbnail ? (
                      <Img
                        src={item.thumbnail}
                        width={48}
                        alt=""
                        style={{ display: "block", width: 48, height: "auto" }}
                      />
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </Column>
          <Column style={{ ...ruled, padding: "16px 0" }}>
            <Text style={{ margin: 0, ...serif, ...TEXT.xl }}>{item.title}</Text>
            {item.description ? (
              <Text style={{ margin: "4px 0 0", ...TEXT.xs, color: COLOR.sage }}>
                {item.description}
              </Text>
            ) : null}
          </Column>
          <Column
            align="right"
            style={{ ...ruled, padding: "16px 0 16px 16px", ...TEXT.sm, whiteSpace: "nowrap" }}
          >
            {item.price}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export type TotalLine = { label: string; value: string; tone?: "discount" | "muted" };

/** The amounts under a summary, ending with the grand total in large type. */
export function Totals({
  lines,
  total,
}: {
  lines: TotalLine[];
  total: { label: string; value: string; caption?: string };
}) {
  const totalCell: CSSProperties = { paddingTop: 16, borderTop: `1px solid ${COLOR.rule}` };

  return (
    <Section style={{ margin: `0 0 ${GAP}px`, ...TEXT.sm }}>
      {lines.map((line) => {
        const tone: CSSProperties = line.tone === "discount" ? { fontWeight: 500 } : {};
        return (
          <Row key={line.label} style={tone}>
            <Column style={{ padding: "0 16px 8px 0" }}>{line.label}</Column>
            <Column
              align="right"
              style={{
                padding: "0 0 8px",
                whiteSpace: "nowrap",
                ...(line.tone === "muted" ? { color: COLOR.sage } : {}),
              }}
            >
              {line.value}
            </Column>
          </Row>
        );
      })}
      <Row>
        <Column style={{ ...totalCell, paddingRight: 16, fontWeight: 500 }}>{total.label}</Column>
        <Column
          align="right"
          style={{
            ...totalCell,
            ...serif,
            ...TEXT["3xl"],
            whiteSpace: "nowrap",
          }}
        >
          {total.value}
        </Column>
      </Row>
      {total.caption ? (
        <Row>
          <Column align="right" style={{ paddingTop: 8, ...TEXT.xs, color: COLOR.sage }}>
            {total.caption}
          </Column>
        </Row>
      ) : null}
    </Section>
  );
}
