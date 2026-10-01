import { PATHS } from "@coupdecanon/config/routes";
import { SHOP } from "@coupdecanon/config/shop";
import type { CSSProperties } from "react";

export const BRAND = SHOP.name;

/** "La boutique du Domaine de Ouézy", under the brand in every e-mail's footer. */
export const TAGLINE = SHOP.tagline;

/**
 * Files the storefront serves for the e-mails (`apps/storefront/public/email`): the official
 * logo, rendered to PNG from `packages/ui`'s `Logo` since mail clients don't show SVG, and the
 * brand's serif.
 */
export const emailAssets = (storefrontUrl: string) => ({
  /** Forest, for the cream header. 393 × 168 px, shown at a third of that. */
  logo: `${storefrontUrl}/email/logo-forest.png`,
  /** Cream, for the forest footer. */
  logoOnForest: `${storefrontUrl}/email/logo-cream.png`,
  serif: `${storefrontUrl}/email/cdc-serif-roman.woff2`,
});

/** The logo's proportions, 1266 × 541 in its SVG. */
export const logoWidth = (height: number) => Math.round((height * 1266) / 541);

/** Storefront pages the e-mails link to. */
export const storefrontLinks = (storefrontUrl: string) => ({
  home: storefrontUrl,
  shop: `${storefrontUrl}${PATHS.shop}`,
  estate: `${storefrontUrl}${PATHS.estate}`,
  account: `${storefrontUrl}${PATHS.account}`,
  help: `${storefrontUrl}${PATHS.help}`,
});

/**
 * The design's palette, the storefront's tokens (`packages/ui/src/styles/globals.css`).
 * Its translucent rules are flattened onto their background, since some mail clients drop
 * rgba().
 */
export const COLOR = {
  cream: "#f3f1e7",
  stone: "#e8e3d5",
  sage: "#56624f",
  mist: "#bcc7ae",
  forest: "#1f3a2a",
  /** The site's `border`: forest at 15% on cream. */
  rule: "#d3d6cb",
  /** The site's `border` in forest sections: cream at 20% on forest. */
  ruleOnForest: "#495f50",
};

/**
 * The storefront's type scale, at its phone sizes: an e-mail is at most 600px wide.
 * Sans for text (xs to base), serif for titles (xl to 4xl).
 */
export const TEXT = {
  xs: { fontSize: 13, lineHeight: 1.5 },
  sm: { fontSize: 15, lineHeight: 1.6 },
  base: { fontSize: 16, lineHeight: 1.7 },
  xl: { fontSize: 22, lineHeight: 1.2 },
  "2xl": { fontSize: 28, lineHeight: 1.2 },
  "3xl": { fontSize: 36, lineHeight: 1.1 },
  "4xl": { fontSize: 44, lineHeight: 1.05 },
} satisfies Record<string, CSSProperties>;

/** CdC Serif, like the storefront, at its one weight: clients that can't load it use Georgia. */
export const SERIF = "'CdC Serif', Georgia, 'Times New Roman', serif";
export const SERIF_WEIGHT = 500;
export const SANS = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Prices and amounts print like on the storefront. */
export { formatAmount, formatPrice } from "@coupdecanon/config/format";

/** Dates may arrive as ISO strings, from the preview server's props editor. */
export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(
    new Date(date),
  );

export const formatDateTime = (date: Date | string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(date));

export const formatAddress = (address?: {
  address_1?: string | null;
  postal_code?: string | null;
  city?: string | null;
}) =>
  [address?.address_1, [address?.postal_code, address?.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
