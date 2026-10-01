/**
 * Formats shared by the storefront and the e-mails, in French: amounts, percentages, order
 * numbers, and the no-break spaces French typography puts before some signs.
 */

/**
 * A number as Intl prints it in French, save the space before its sign: the shop writes
 * "129€" and "10%", sign against the number. Thousands keep their narrow space: "1 290€".
 */
const printTight = (format: Intl.NumberFormat, value: number) => {
  const parts = format.formatToParts(value);
  return parts
    .filter((part, index) => {
      const next = parts[index + 1]?.type;
      return !(part.type === "literal" && (next === "currency" || next === "percentSign"));
    })
    .map((part) => part.value)
    .join("");
};

/** Whole amounts print without cents, like the mockups: "30€", "3,50€". */
export const formatPrice = (amount: number, currencyCode: string) =>
  printTight(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }),
    amount,
  );

/**
 * "84,00€": an order's amounts, which line up with their cents, rather than mixing "84€"
 * with "−8,40€". Prices on their own keep `formatPrice`.
 */
export const formatAmount = (amount: number, currencyCode: string) =>
  printTight(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
    }),
    amount,
  );

/** "10%", from 10. */
export const formatPercent = (percent: number) =>
  printTight(
    new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 2 }),
    percent / 100,
  );

/** "n°514": an order's number, as the shop writes it, against its sign. */
export const orderNumber = (displayId: number | string | null | undefined) =>
  displayId === null || displayId === undefined ? "" : `n°${displayId}`;

/** "1 bouteille", "12 bouteilles": a no-break space keeps the number with its noun. */
export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count}\u00a0${count > 1 ? plural : singular}`;

/** "a, b et c". */
export const listInFrench = (items: string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`
    : (items[0] ?? "");
