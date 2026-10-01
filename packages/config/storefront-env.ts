import * as z from "zod";
import { optional, parseEnv } from "./load";

/** The storefront's server-side environment: it needs none of the backend's secrets. */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /** Where the storefront's server reaches Medusa's store API. */
  MEDUSA_BACKEND_URL: z.url(),
  /** Scopes the store API to the online sales channel; Medusa creates it on its first start. */
  MEDUSA_PUBLISHABLE_KEY: z.string().startsWith("pk_"),

  /** Stripe's public key, for the card form; without it, cards aren't offered at checkout. */
  STRIPE_PUBLISHABLE_KEY: optional(z.string().startsWith("pk_")),

  /** The storefront's public origin, for canonical URLs, the sitemap and structured data. */
  STOREFRONT_URL: z.url(),

  /** Payload's database, beside Medusa's: the site's content lives there. */
  PAYLOAD_DATABASE_URL: z.url(),
  /** Signs Payload's admin sessions. */
  PAYLOAD_SECRET: z.string().min(32),

  /** The mail server Payload's admin writes through, as Medusa's e-mails do: password resets. */
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.stringbool(),
  SMTP_USER: optional(z.string()),
  SMTP_PASSWORD: optional(z.string()),
  EMAIL_FROM: z.email(),
});

export type StorefrontEnv = z.infer<typeof schema>;

export const env = parseEnv(schema);
