import * as z from "zod";
import { optional, parseEnv } from "./load";

const origins = z
  .string()
  .min(1)
  .refine((value) => value.split(",").every((origin) => z.url().safeParse(origin).success), {
    message: "Expected comma-separated URLs",
  });

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),

  STORE_CORS: origins,
  ADMIN_CORS: origins,
  AUTH_CORS: origins,

  JWT_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),

  S3_FILE_URL: z.url(),
  S3_ENDPOINT: optional(z.url()),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),

  STRIPE_API_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: optional(z.string().startsWith("whsec_")),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.stringbool(),
  SMTP_USER: optional(z.string()),
  SMTP_PASSWORD: optional(z.string()),
  EMAIL_FROM: z.email(),

  /** Where e-mails link to: the admin for the team, the storefront for customers. */
  ADMIN_URL: z.url(),
  STOREFRONT_URL: z.url(),
});

export type Env = z.infer<typeof schema>;

export const env = parseEnv(schema);
