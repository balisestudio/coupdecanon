import { SHOP } from "@coupdecanon/config/shop";
import { phoneToE164, type ShopInfo, WEEKDAYS } from "@coupdecanon/config/shop-info";
import type { ProductSummary } from "./catalog.server";

type Meta =
  | { title?: string }
  | { name: string; content: string }
  | { property: string; content: string };

/** "Page – Coup de Canon": every page's title ends with the shop's name, after an en dash. */
export const pageTitle = (title: string) => `${title} – ${SHOP.name}`;

/**
 * Title, description, canonical URL and their Open Graph and Twitter counterparts. `noindex`
 * keeps a variant of a page, such as a filtered list, out of search results while its links
 * are still followed; its canonical URL points at the plain page.
 */
export function pageMeta({
  siteUrl,
  path,
  title,
  description,
  noindex = false,
  image,
  type = "website",
}: {
  siteUrl: string;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  /** The picture link previews show, such as a product's photo. */
  image?: string | null;
  type?: "website" | "product";
}): { meta: Meta[]; links: { rel: string; href: string }[] } {
  const url = `${siteUrl}${path}`;
  // Without a picture of its own, a page shares the logo on the shop's cream (`public/og.png`).
  const shared = image
    ? [{ property: "og:image", content: image }]
    : [
        { property: "og:image", content: `${siteUrl}/og.png` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: SHOP.name },
      ];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      ...shared,
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/**
 * A `<script type="application/ld+json">` for the route's head. Its text comes from Medusa:
 * a "<" in a product's description can't close the script early.
 */
export const jsonLd = (data: object) => ({
  type: "application/ld+json",
  children: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c"),
});

/** The shop as a local business: name, address and contact details for search engines. */
export const storeJsonLd = (siteUrl: string, shop: ShopInfo) =>
  jsonLd({
    "@type": "Store",
    "@id": `${siteUrl}/#boutique`,
    name: shop.name,
    ...(shop.legal ? { legalName: shop.legal.legal_name } : {}),
    description: `${SHOP.tagline} : cidres, poirés, jus, calvados et épicerie de la ferme, en agriculture biologique depuis ${SHOP.foundingYear}.`,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/icon-512.png`,
    foundingDate: String(SHOP.foundingYear),
    ...(shop.contact
      ? {
          telephone: phoneToE164(shop.contact.phone),
          email: shop.contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: shop.contact.address.street,
            postalCode: shop.contact.address.postal_code,
            addressLocality: shop.contact.address.city,
            ...(shop.contact.address.region ? { addressRegion: shop.contact.address.region } : {}),
            addressCountry: shop.contact.address.country_code.toUpperCase(),
          },
        }
      : {}),
    ...(shop.hours
      ? {
          openingHoursSpecification: WEEKDAYS.flatMap((day) =>
            (shop.hours?.[day] ?? []).map((span) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: `https://schema.org/${day[0]?.toUpperCase()}${day.slice(1)}`,
              opens: span.opens,
              closes: span.closes,
            })),
          ),
        }
      : {}),
    parentOrganization: { "@type": "Organization", name: SHOP.estate },
  });

/** The page's place in the site, from the home page down. */
export const breadcrumbJsonLd = (siteUrl: string, trail: { name: string; path: string }[]) =>
  jsonLd({
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteUrl}${step.path}`,
    })),
  });

export const websiteJsonLd = (siteUrl: string) =>
  jsonLd({
    "@type": "WebSite",
    "@id": `${siteUrl}/#site`,
    name: SHOP.name,
    url: `${siteUrl}/`,
    inLanguage: "fr-FR",
    publisher: { "@id": `${siteUrl}/#boutique` },
  });

/** Products as a list of offers, priced tax included. */
export const productListJsonLd = (
  siteUrl: string,
  name: string,
  products: ProductSummary[],
  currencyCode: string,
) =>
  jsonLd({
    "@type": "ItemList",
    name,
    itemListElement: products.map((product, index) => {
      const url = `${siteUrl}${product.path}`;
      const currency = currencyCode.toUpperCase();
      return {
        "@type": "ListItem",
        position: index + 1,
        url,
        item: {
          "@type": "Product",
          name: product.title,
          url,
          ...(product.subtitle ? { description: product.subtitle } : {}),
          ...(product.thumbnail ? { image: product.thumbnail } : {}),
          ...(product.family ? { category: product.family } : {}),
          brand: { "@type": "Brand", name: SHOP.estate },
          ...(product.price
            ? {
                offers: product.price.varies
                  ? {
                      "@type": "AggregateOffer",
                      lowPrice: product.price.amount,
                      highPrice: product.price.highest,
                      priceCurrency: currency,
                    }
                  : {
                      "@type": "Offer",
                      price: product.price.amount,
                      priceCurrency: currency,
                      url,
                    },
              }
            : {}),
        },
      };
    }),
  });

/** A product in full, with an offer per format, tax included. */
export const productJsonLd = (
  siteUrl: string,
  product: ProductSummary & { description: string | null; images: string[] },
  currencyCode: string,
) => {
  const url = `${siteUrl}${product.path}`;
  const currency = currencyCode.toUpperCase();
  const offers = product.formats.flatMap((format) =>
    format.price === null
      ? []
      : [
          {
            "@type": "Offer",
            name: format.title,
            price: format.price,
            priceCurrency: currency,
            availability: format.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url,
          },
        ],
  );
  return jsonLd({
    "@type": "Product",
    name: product.title,
    url,
    ...((product.description ?? product.subtitle)
      ? { description: product.description ?? product.subtitle }
      : {}),
    ...(product.images.length ? { image: product.images } : {}),
    ...(product.family ? { category: product.family } : {}),
    brand: { "@type": "Brand", name: SHOP.estate },
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
  });
};
