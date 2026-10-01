import { payloadParseSearch, payloadStringifySearch } from "@payloadcms/tanstack-start/shared";
import { createRouter } from "@tanstack/react-router";
import { SiteError } from "./components/site-error";
import { routeTree } from "./routeTree.gen";

/**
 * Query strings stay plain, as people and search engines write them: `?q=75`, not the
 * router's JSON `?q=%2275%22`. Payload's admin nests its own, `?where[or][0]…`, so both are
 * read and written as Payload does. Every value reads as text; the routes' schemas take it
 * from there. Empty values stay out of the URL.
 */
const parseSearch = payloadParseSearch;

const stringifySearch = (search: Record<string, unknown>) =>
  payloadStringifySearch(
    Object.fromEntries(
      Object.entries(search).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    ),
  );

export function getRouter() {
  return createRouter({
    routeTree,
    parseSearch,
    stringifySearch,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: SiteError,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
