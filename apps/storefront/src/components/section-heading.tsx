import { cn } from "@coupdecanon/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * A section's title with a small link beside it, such as "Voir les 12 produits". On desktop,
 * the link sits at the right, on the baseline of the title's last line; on phones, under it.
 */
export function SectionHeading({
  children,
  action,
  className,
}: {
  /** The title, a heading element. */
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 lg:flex-row lg:items-baseline-last lg:justify-between lg:gap-8",
        className,
      )}
    >
      {children}
      {action}
    </div>
  );
}
