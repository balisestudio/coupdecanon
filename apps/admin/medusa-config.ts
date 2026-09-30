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
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { redisUrl: env.REDIS_URL } },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: { redisUrl: env.REDIS_URL },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: { channels: ["feed"] },
          },
          {
            resolve: "./src/modules/smtp-notification",
            id: "smtp",
            options: {
              channels: ["email"],
              host: env.SMTP_HOST,
              port: env.SMTP_PORT,
              secure: env.SMTP_SECURE,
              user: env.SMTP_USER,
              password: env.SMTP_PASSWORD,
              from: env.EMAIL_FROM,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: env.STRIPE_API_KEY,
              webhookSecret: env.STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
  ],
});
