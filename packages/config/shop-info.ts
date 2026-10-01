/**
 * The shop's details, which the team edits in Payload's "Réglages de la boutique": its contact
 * details, legal identity, host and consumer mediator, and opening hours. This module has no
 * dependencies, so browsers can import it; `shop-settings.ts` reads Payload's settings.
 */

export type ShopAddress = {
  /** A named place before the street, such as "Château de Ouézy". */
  place?: string;
  street: string;
  postal_code: string;
  city: string;
  region?: string;
  /** ISO 3166-1 alpha-2, such as "fr". */
  country_code: string;
};

export type ShopContact = {
  /** As printed: "02 31 40 68 19". */
  phone: string;
  email: string;
  address: ShopAddress;
};

export type ShopLegal = {
  legal_name: string;
  legal_form: string;
  siren: string;
  siret: string;
  /** The registered office, on one line. */
  address: string;
  /** The register the business is entered in: "Registre national des entreprises". */
  registration?: string;
  /** The intra-community VAT number: "FR32410727150". */
  vat_number?: string;
  /** A company's share capital, as printed: "10 000 euros". An individual business has none. */
  share_capital?: string;
  /** The person responsible for the site's content; the legal name when left out. */
  publication_director?: string;
};

/** The website's host, which the legal notice must name. */
export type ShopHost = { name: string; address: string; phone?: string };

/** The consumer mediator, which the terms of sale must name. */
export type ShopMediator = { name: string; website: string; address?: string };

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** A day's opening, "HH:MM" to "HH:MM". */
export type OpeningSpan = { opens: string; closes: string };

/** The shop's opening hours, day by day: a day left out, or empty, is closed. */
export type ShopHours = Partial<Record<Weekday, OpeningSpan[]>>;

export type ShopInfo = {
  name: string;
  /** Null when the settings have none, or an invalid one. */
  contact: ShopContact | null;
  legal: ShopLegal | null;
  host: ShopHost | null;
  mediator: ShopMediator | null;
  hours: ShopHours | null;
};

const DAY_NAMES: Record<Weekday, string> = {
  monday: "lundi",
  tuesday: "mardi",
  wednesday: "mercredi",
  thursday: "jeudi",
  friday: "vendredi",
  saturday: "samedi",
  sunday: "dimanche",
};

/** "10:00" → "10 h", "12:30" → "12 h 30". */
const formatTime = (time: string) => {
  const [hours = "0", minutes = "00"] = time.split(":");
  return `${Number(hours)}\u00a0h${minutes === "00" ? "" : `\u00a0${minutes}`}`;
};

const formatSpans = (spans: OpeningSpan[]) =>
  spans.map((span) => `${formatTime(span.opens)} – ${formatTime(span.closes)}`).join(" et ");

/**
 * The hours as the shop prints them, days with the same hours grouped: "Du mardi au samedi",
 * "10 h – 12 h 30 et 14 h – 18 h". Closed days are left out.
 */
export function formatHours(hours: ShopHours) {
  const groups: { days: Weekday[]; times: string }[] = [];
  for (const day of WEEKDAYS) {
    const spans = hours[day] ?? [];
    if (!spans.length) continue;
    const times = formatSpans(spans);
    const last = groups[groups.length - 1];
    const previousDay = WEEKDAYS[WEEKDAYS.indexOf(day) - 1];
    if (last && last.times === times && previousDay && last.days.includes(previousDay)) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], times });
    }
  }
  return groups.map(({ days, times }) => {
    const first = DAY_NAMES[days[0] ?? "monday"];
    const last = DAY_NAMES[days[days.length - 1] ?? "monday"];
    const label =
      days.length === 1
        ? `Le ${first}`
        : days.length === 2
          ? `Le ${first} et le ${last}`
          : `Du ${first} au ${last}`;
    return { days: label, times };
  });
}

/** "02 31 40 68 19" → "+33231406819", for `tel:` links. French numbers only need no prefix. */
export function phoneToE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+33${digits.slice(1)}`;
  return `+${digits}`;
}

/** "Château de Ouézy, 22 rue Auguste Lemonnier, 14270 Ouézy". */
export const formatAddress = (address: ShopAddress) =>
  [address.place, address.street, `${address.postal_code} ${address.city}`]
    .filter(Boolean)
    .join(", ");

/** "41072715000014" → "410 727 150 00014". */
export const formatSiret = (siret: string) =>
  siret.replace(/\s/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, "$1 $2 $3 $4");

/** "410727150" → "410 727 150". */
export const formatSiren = (siren: string) => siren.replace(/(\d{3})(?=\d)/g, "$1 ");

/** "https://www.coupdecanon.fr/" → "www.coupdecanon.fr": an address as documents print it. */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * The seller as a sentence names them: their name, then their legal form, which must follow it
 * for an individual entrepreneur. "Hervé Delom de Mézerac, entrepreneur individuel (EI)": a form
 * spelled out loses its capital, an acronym such as "SARL" keeps it.
 */
export function sellerName(legal: Pick<ShopLegal, "legal_name" | "legal_form">) {
  const form = /^\p{Lu}\p{Ll}/u.test(legal.legal_form)
    ? legal.legal_form.charAt(0).toLowerCase() + legal.legal_form.slice(1)
    : legal.legal_form;
  return `${legal.legal_name}, ${form}`;
}
