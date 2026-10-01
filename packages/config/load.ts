import { existsSync } from "node:fs";
import * as z from "zod";

// Apps and scripts run from their package, two levels under the root .env.
if (existsSync("../../.env")) process.loadEnvFile("../../.env");

// An empty value in a .env file ("S3_ENDPOINT=") means the variable is unset.
export const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export function parseEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
