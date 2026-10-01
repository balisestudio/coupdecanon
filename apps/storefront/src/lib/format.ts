import { formatAmount, formatPrice, pluralize } from "@coupdecanon/config/format";

/** Prices and amounts print like in the e-mails. */
export { formatAmount, formatPrice };

/** "7 €", or "Dès 18 €" when the product's formats have different prices. */
export const formatFromPrice = (
  price: { amount: number; varies: boolean },
  currencyCode: string,
) =>
  price.varies
    ? `Dès ${formatPrice(price.amount, currencyCode)}`
    : formatPrice(price.amount, currencyCode);

/** "1 produit", "18 produits". */
export const pluralizeProducts = (count: number) => pluralize(count, "produit");
