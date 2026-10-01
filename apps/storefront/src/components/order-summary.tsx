import { cn } from "@coupdecanon/ui/lib/utils";
import type { ReactNode } from "react";
import { formatAmount } from "../lib/format";
import { Price } from "./price";

/**
 * An order's amounts: the subtotal, the volume discount, the pickup, the total in large, and
 * what was refunded of it, if anything. The cart, the checkout, the confirmation and the
 * account show it alike.
 */
export function OrderTotals({
  subtotal,
  discount,
  total,
  refunded = 0,
  discountLabel,
  currencyCode,
  totalLabel = "Total",
  updating = false,
  className,
}: {
  subtotal: number;
  discount: number;
  total: number;
  /** All the refunds together, once the shop has made some. */
  refunded?: number;
  /** The discount's name, such as "Remise de 10%". */
  discountLabel: string;
  currencyCode: string;
  totalLabel?: string;
  /** Amounts worked out in the browser while Medusa confirms them. */
  updating?: boolean;
  className?: string;
}) {
  const row = "flex items-baseline justify-between gap-6 text-sm";

  return (
    <dl aria-busy={updating || undefined} className={cn("flex flex-col gap-4", className)}>
      <div className={row}>
        <dt>Sous-total</dt>
        <dd>{formatAmount(subtotal, currencyCode)}</dd>
      </div>
      {discount > 0 ? (
        <div className={cn(row, "font-medium")}>
          <dt>{discountLabel}</dt>
          <dd>−{formatAmount(discount, currencyCode)}</dd>
        </div>
      ) : null}
      <div className={row}>
        <dt>Retrait au domaine</dt>
        <dd className="text-muted-foreground">Gratuit</dd>
      </div>
      <div className="flex items-baseline justify-between gap-6 border-t pt-4">
        <dt className="text-sm font-medium">{totalLabel}</dt>
        <dd>
          <Price as="span" className="text-3xl">
            {formatAmount(total, currencyCode)}
          </Price>
        </dd>
      </div>
      {refunded > 0 ? (
        <>
          <div className={row}>
            <dt>Remboursé</dt>
            <dd>−{formatAmount(refunded, currencyCode)}</dd>
          </div>
          <div className={cn(row, "font-medium")}>
            <dt>Total après remboursement</dt>
            <dd>{formatAmount(Math.max(0, total - refunded), currencyCode)}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

/** A tinted panel beside a page's content, such as the order's summary. */
export function SummaryPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label={title}
      className={cn("flex flex-col gap-6 bg-card p-8 lg:sticky lg:top-32", className)}
    >
      <h2 className="text-3xl">{title}</h2>
      {children}
    </aside>
  );
}
