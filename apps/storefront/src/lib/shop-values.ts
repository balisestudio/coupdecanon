import {
  displayUrl,
  formatAddress,
  formatSiren,
  formatSiret,
  phoneToE164,
  type ShopInfo,
  sellerName,
} from "@coupdecanon/config/shop-info";

/**
 * The shop's details a text written in Payload can quote, such as the legal documents: the
 * team inserts one where it belongs, and the page prints its current value from the settings.
 */
export const SHOP_VALUES = {
  siteAddress: "Adresse du site",
  seller: "Vendeur : nom et forme juridique",
  legalName: "Raison sociale",
  legalForm: "Forme juridique",
  siren: "SIREN",
  siret: "SIRET",
  registeredOffice: "Siège social",
  registration: "Registre d’immatriculation",
  vatNumber: "N° de TVA intracommunautaire",
  shareCapital: "Capital social",
  publicationDirector: "Directeur de la publication",
  phone: "Téléphone de la boutique",
  email: "E-mail de la boutique",
  shopAddress: "Adresse de la boutique",
  hostName: "Hébergeur : nom",
  hostAddress: "Hébergeur : adresse",
  hostPhone: "Hébergeur : téléphone",
  mediatorName: "Médiateur : nom",
  mediatorAddress: "Médiateur : adresse",
  mediatorWebsite: "Médiateur : site web",
} as const;

export type ShopValueKey = keyof typeof SHOP_VALUES;

export const isShopValueKey = (key: unknown): key is ShopValueKey =>
  typeof key === "string" && key in SHOP_VALUES;

/** A value as a page prints it, with where it leads for a phone, an e-mail or a website. */
export type ShopValue = { text: string; href?: string };

const plain = (text: string | null | undefined): ShopValue | null => (text ? { text } : null);

/** A detail's current value, or `null` while the settings lack it. */
export function shopValue(key: ShopValueKey, shop: ShopInfo, siteUrl: string): ShopValue | null {
  const { legal, contact, host, mediator } = shop;
  switch (key) {
    case "siteAddress":
      return plain(displayUrl(siteUrl));
    case "seller":
      return plain(legal && sellerName(legal));
    case "legalName":
      return plain(legal?.legal_name);
    case "legalForm":
      return plain(legal?.legal_form);
    case "siren":
      return plain(legal && formatSiren(legal.siren));
    case "siret":
      return plain(legal && formatSiret(legal.siret));
    case "registeredOffice":
      return plain(legal?.address);
    case "registration":
      return plain(legal?.registration);
    case "vatNumber":
      return plain(legal?.vat_number);
    case "shareCapital":
      return plain(legal?.share_capital);
    case "publicationDirector":
      return plain(legal && (legal.publication_director ?? legal.legal_name));
    case "phone":
      return contact ? { text: contact.phone, href: `tel:${phoneToE164(contact.phone)}` } : null;
    case "email":
      return contact ? { text: contact.email, href: `mailto:${contact.email}` } : null;
    case "shopAddress":
      return plain(contact && formatAddress(contact.address));
    case "hostName":
      return plain(host?.name);
    case "hostAddress":
      return plain(host?.address);
    case "hostPhone":
      return host?.phone ? { text: host.phone, href: `tel:${phoneToE164(host.phone)}` } : null;
    case "mediatorName":
      return plain(mediator?.name);
    case "mediatorAddress":
      return plain(mediator?.address);
    case "mediatorWebsite":
      return mediator ? { text: displayUrl(mediator.website), href: mediator.website } : null;
  }
}
