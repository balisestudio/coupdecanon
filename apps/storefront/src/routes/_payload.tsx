import { payloadLayoutRoute } from "@payloadcms/tanstack-start/client";
import { createFileRoute } from "@tanstack/react-router";
import styles from "../payload.css?url";
import { getLayoutDataFn, serverFunctionHandler } from "./_payload/server.functions";

/** Payload's admin, at /admin, with its own styles: none of the site's reach it. */
export const Route = createFileRoute("/_payload")({
  head: () => ({ links: [{ rel: "stylesheet", href: styles }] }),
  ...payloadLayoutRoute({ load: getLayoutDataFn, serverFunction: serverFunctionHandler }),
});
