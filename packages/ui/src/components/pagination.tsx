import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Pages"
      data-slot="pagination"
      className={cn("flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * A page's link, the current page's outlined; `wide` for "Précédente" and "Suivante". Apps
 * pass their router's link as the child, with `asChild`.
 */
function PaginationLink({
  className,
  isActive = false,
  wide = false,
  asChild = false,
  ...props
}: React.ComponentProps<"a"> & { isActive?: boolean; wide?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size: wide ? "sm" : "icon" }),
        wide ? "gap-1 px-3" : "size-11",
        "text-sm no-underline",
        className,
      )}
      {...props}
    />
  );
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink };
