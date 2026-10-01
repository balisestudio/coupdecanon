import config from "@payload-config";
import { type GlobalSlug, getPayload } from "payload";

/** Payload's Local API, in the storefront's own process: no round trip over HTTP. */
export const getCms = () => getPayload({ config });

/** A global's content as the team saved it, its photos included. */
export async function readGlobal<Slug extends GlobalSlug>(slug: Slug) {
  const cms = await getCms();
  return cms.findGlobal({ slug, depth: 1 });
}
