import { payloadAdminSplatRoute } from "@payloadcms/tanstack-start/client";
import { createFileRoute } from "@tanstack/react-router";
import { loadAdminPageRSC } from "./server.functions";

export const Route = createFileRoute("/_payload/admin/$")(
  payloadAdminSplatRoute({ load: loadAdminPageRSC }),
);
