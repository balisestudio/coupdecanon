import { cn } from "@coupdecanon/ui/lib/utils";
import type { ReactNode } from "react";
import { archClipPath } from "../lib/arch-shape";
import { seedFrom } from "../lib/cutout-shape";

/**
 * Frames a photo in a hand-cut arch, seeded by `name`: each arch its own, the same on every
 * visit. The frame takes the size and ratio from `className`; what it frames fills it.
 */
export function Arch({
  name,
  className,
  children,
}: {
  name: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("@container", className)}>
      <div className="size-full overflow-hidden" style={{ clipPath: archClipPath(seedFrom(name)) }}>
        {children}
      </div>
    </div>
  );
}
