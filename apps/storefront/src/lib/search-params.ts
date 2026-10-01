import { createLoader, type inferParserType, type ParserMap } from "nuqs/server";

/** A query string's values, each one there only when the URL gives it. */
export type SearchValues<Parsers extends ParserMap> = {
  [Key in keyof Parsers]?: inferParserType<Parsers[Key]>;
};

/**
 * A route's query string, as nuqs's parsers read it: the router's `validateSearch` and the
 * server functions share it, and the pages' `useQueryStates` read the same parsers. The
 * router hands every value over as text, or as the value a link gave it (see `router.tsx`).
 * A value a page doesn't expect is ignored rather than breaking it, and a default stays out
 * of the result, so a page keeps a single address.
 */
export function searchSchema<Parsers extends ParserMap>(parsers: Parsers) {
  const load = createLoader(parsers);
  return (input: Record<string, unknown>): SearchValues<Parsers> => {
    const given = Object.fromEntries(
      Object.entries(input ?? {}).flatMap(([key, value]) =>
        key in parsers && value !== undefined && value !== null && value !== ""
          ? [[key, String(value)]]
          : [],
      ),
    );
    const values = load(given) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        const parser = parsers[key] as {
          defaultValue?: unknown;
          eq: (a: never, b: never) => boolean;
        };
        if (!(key in given) || value === null) return false;
        return (
          parser.defaultValue === undefined ||
          !parser.eq(value as never, parser.defaultValue as never)
        );
      }),
    ) as SearchValues<Parsers>;
  };
}
