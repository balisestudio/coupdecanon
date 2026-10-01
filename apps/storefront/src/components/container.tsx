import { cn } from "@coupdecanon/ui/lib/utils";
import type { ComponentProps } from "react";

/** The page's width and side gutters. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page px-gutter", className)} {...props} />;
}
