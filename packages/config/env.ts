import { existsSync } from "node:fs";
import * as z from "zod";

// Scripts run from their package, two levels under the root .env.
if (existsSync("../../.env")) process.loadEnvFile("../../.env");

// An empty value in a .env file ("S3_ENDPOINT=") means the variable is unset.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

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
});

export type Env = z.infer<typeof schema>;

function parseEnv(): Env {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}

export const env = parseEnv();
