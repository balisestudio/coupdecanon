import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import cdcSerifRoman from "../fonts/cdc-serif-roman.woff2?url";

/** The fonts that paint the first screen, for apps to preload in their document head. */
export const PRELOAD_FONTS = [{ href: cdcSerifRoman, type: "font/woff2" }] as const;

/**
 * The sans-serif's file, for frames that can't read the page's styles, such as Stripe's card
 * form: they load it themselves.
 */
export const SANS_FONT_FILE = interLatin;
