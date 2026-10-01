import { LoaderCircleIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/utils";

/** A turning circle, for work in progress. It names itself "Chargement" for screen readers. */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderCircleIcon
      role="status"
      aria-label="Chargement"
      data-slot="spinner"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
