import { payloadApiHandlers } from "@payloadcms/tanstack-start/server";
import { createFileRoute } from "@tanstack/react-router";

/** Payload's REST API, at /api: what the admin uses, and what Medusa's e-mails read. */
export const Route = createFileRoute("/_payload/api/$")({
  server: {
    handlers: payloadApiHandlers({
      getConfig: async () => (await import("@payload-config")).default,
    }),
  },
});
