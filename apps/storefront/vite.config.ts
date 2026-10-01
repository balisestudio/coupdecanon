import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * TanStack Start, with Payload's admin and API inside it (see `src/payload.config.ts`):
 * Payload's helper adds the options its admin needs to each plugin.
 */
export default defineConfig(
  withPayload(
    ({ pluginOptions }) => ({
      plugins: [
        tailwindcss(),
        rsc(pluginOptions.rsc),
        tanstackStart(pluginOptions.tanstackStart),
        viteReact(pluginOptions.react),
      ],
    }),
    {
      payloadConfigPath: path.resolve(dirname, "src/payload.config.ts"),
      routesDirectory: "routes",
    },
  ),
);
