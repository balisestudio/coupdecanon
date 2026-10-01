import { cn } from "@coupdecanon/ui/lib/utils";
import type { ComponentProps } from "react";

/**
 * A price as the site shows it everywhere: in the serif, the size of the small titles, aligned
 * figures. A paragraph by default; `as="span"` inside a label or a sentence.
 */
export function Price({
  as: Element = "p",
  className,
  ...props
}: { as?: "p" | "span" } & Omit<ComponentProps<"span">, "ref">) {
  return <Element className={cn("font-serif text-xl font-medium", className)} {...props} />;
}
