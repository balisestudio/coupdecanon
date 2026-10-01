import * as z from "zod";
import {
  type ShopContact,
  type ShopHost,
  type ShopHours,
  type ShopInfo,
  type ShopLegal,
  type ShopMediator,
  WEEKDAYS,
} from "./shop-info";

/**
 * Reads the shop's details from Payload's "settings" global, as its REST API or its Local API
 * returns them: an optional field left empty comes back `null` or `""`, an array row carries
 * its `id`, and numbers may carry spaces. Each part is checked on its own.
 */

/** An optional text: `null` and blanks count as missing. */
const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().optional(),
);
const text = z.string().trim().min(1);
/** "410 727 150" → "410727150". */
const digits = (length: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.replace(/\s/g, "") : value),
    z.string().regex(new RegExp(`^\\d{${length}}$`)),
  );

const contactSchema = z.object({
  phone: text,
  email: z.email(),
  address: z.object({
    place: optionalText,
    street: text,
    postal_code: text,
    city: text,
    region: optionalText,
    country_code: z.string().trim().toLowerCase().length(2),
  }),
}) satisfies z.ZodType<ShopContact, unknown>;

const legalSchema = z.object({
  legal_name: text,
  legal_form: text,
  siren: digits(9),
  siret: digits(14),
  address: text,
  registration: optionalText,
  vat_number: optionalText,
  share_capital: optionalText,
  publication_director: optionalText,
}) satisfies z.ZodType<ShopLegal, unknown>;

const hostSchema = z.object({
  name: text,
  address: text,
  phone: optionalText,
}) satisfies z.ZodType<ShopHost, unknown>;

const mediatorSchema = z.object({
  name: text,
  website: z.url(),
  address: optionalText,
}) satisfies z.ZodType<ShopMediator, unknown>;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const spanSchema = z
  .object({ opens: z.string().regex(TIME), closes: z.string().regex(TIME) })
  .refine((span) => span.opens < span.closes, "A span closes after it opens");
const hoursSchema = z
  .partialRecord(z.enum(WEEKDAYS), z.array(spanSchema).max(3).nullish())
  .transform((hours) => {
    const open = Object.entries(hours).filter(([, spans]) => spans?.length);
    return open.length
      ? (Object.fromEntries(
          open.map(([day, spans]) => [
            day,
            (spans ?? []).map(({ opens, closes }) => ({ opens, closes })),
          ]),
        ) as ShopHours)
      : null;
  });

/** Whether a group holds anything: Payload returns an untouched group with empty fields. */
const filled = (value: unknown): boolean =>
  typeof value === "object" &&
  value !== null &&
  Object.values(value).some((entry) =>
    typeof entry === "object" ? filled(entry) : entry !== null && entry !== "",
  );

/**
 * The shop's details from Payload's settings. A missing or malformed part comes back `null`,
 * with the reason in `issues`, so callers render without it rather than fail.
 */
export function parseShopSettings(
  name: string,
  settings: Record<string, unknown> | null | undefined,
): ShopInfo & { issues: string[] } {
  const issues: string[] = [];
  const read = <T>(key: string, schema: z.ZodType<T, unknown>, required: boolean): T | null => {
    const value = settings?.[key];
    if (!filled(value)) {
      if (required) issues.push(`settings.${key} is missing`);
      return null;
    }
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    issues.push(`settings.${key}: ${z.prettifyError(result.error)}`);
    return null;
  };

  return {
    name,
    contact: read("contact", contactSchema, true),
    legal: read("legal", legalSchema, true),
    // Both are required by French law on a shop's website.
    host: read("host", hostSchema, true),
    mediator: read("mediator", mediatorSchema, true),
    hours: read("hours", hoursSchema, true),
    issues,
  };
}
