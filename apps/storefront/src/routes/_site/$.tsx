import { createFileRoute, notFound } from "@tanstack/react-router";

/** Any address the site doesn't know: the layout's "Page introuvable", header and footer kept. */
export const Route = createFileRoute("/_site/$")({
  loader: () => {
    throw notFound();
  },
});
