import { env } from "@coupdecanon/config/env";
import { defineConfig } from "@medusajs/framework/utils";

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    http: {
      storeCors: env.STORE_CORS,
      adminCors: env.ADMIN_CORS,
      authCors: env.AUTH_CORS,
      jwtSecret: env.JWT_SECRET,
      cookieSecret: env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: env.S3_FILE_URL,
              endpoint: env.S3_ENDPOINT,
              region: env.S3_REGION,
              bucket: env.S3_BUCKET,
              access_key_id: env.S3_ACCESS_KEY_ID,
              secret_access_key: env.S3_SECRET_ACCESS_KEY,
              additional_client_config: { forcePathStyle: Boolean(env.S3_ENDPOINT) },
            },
          },
        ],
      },
    },
  ],
});
