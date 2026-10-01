/**
 * Shapes of the content Payload holds, as the components take it. Payload's own types (see
 * `payload-types.ts`) describe the documents; these are the parts components share.
 */

/** Plain data, as JSON holds it. */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * A text written in Payload's rich text editor, as Lexical saves it: plain data, which server
 * functions can return, for `RichText` to render.
 */
export type RichTextData = { root: { [key: string]: Json } };

/** A link the team wrote: its words, where it leads, and shorter words for phones if any. */
export type MenuLink = { label: string; url: string; shortLabel?: string | null };

/** A section's link, which the team may leave out. */
export type ContentLink = { label?: string | null; url?: string | null } | null | undefined;

/** A link, once both its words and its address are there. */
export const linkOf = (link: ContentLink) =>
  link?.label && link.url ? { label: link.label, url: link.url } : null;

/** "Le fruit fait\nle travail": a title the team broke onto lines, each kept. */
export const lines = (text: string | null | undefined) => (text ?? "").split(/\r?\n/);

/**
 * A text with live values inserted: "{produits}" becomes "24 produits". A value unknown for now
 * takes the clause holding it away, between commas: "de trois ans, à {prix} l’unité, et…"
 * becomes "de trois ans, et…".
 */
export function fillIn(text: string | null | undefined, values: Record<string, string | null>) {
  let result = text ?? "";
  for (const [name, value] of Object.entries(values)) {
    const token = `{${name}}`;
    if (!result.includes(token)) continue;
    result =
      value !== null
        ? result.replaceAll(token, value)
        : result.replace(new RegExp(`,?[^,.]*\\{${name}\\}[^,.]*`, "g"), "");
  }
  return result;
}
