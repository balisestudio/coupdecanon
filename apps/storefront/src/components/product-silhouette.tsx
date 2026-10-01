import type { ComponentProps } from "react";
import { BOTTLE_VIEW_BOX, type BottleKind, bottlePath } from "../lib/bottle-shape";
import { seedFrom } from "../lib/cutout-shape";

const JAR = {
  viewBox: "0 0 100 130",
  d: "M22 0 H78 Q84 0 84 6 V16 Q84 22 78 22 H22 Q16 22 16 16 V6 Q16 0 22 0 Z M14 28 H86 Q96 28 96 40 V118 Q96 130 84 130 H16 Q4 130 4 118 V40 Q4 28 14 28 Z",
};

const BOTTLE_BY_FAMILY: Record<string, BottleKind> = {
  "Calvados & Apéritif": "calvados",
  "Cidre & Poiré": "cider",
  Bière: "cider",
  "Jus de fruits": "juice",
};

/**
 * Stands in for a product photo: a cut-out bottle for drinks, a jar for the rest. Each
 * product gets its own bottle, seeded by `name`, the same on every visit.
 */
export function ProductSilhouette({
  family,
  name,
  ...props
}: { family: string | null; name: string } & ComponentProps<"svg">) {
  const bottle = family ? BOTTLE_BY_FAMILY[family] : undefined;

  return bottle ? (
    <svg viewBox={BOTTLE_VIEW_BOX} aria-hidden="true" {...props}>
      <path
        d={bottlePath({ kind: bottle, seed: seedFrom(name) })}
        className="fill-muted-foreground"
      />
    </svg>
  ) : (
    <svg viewBox={JAR.viewBox} aria-hidden="true" data-jar {...props}>
      <path d={JAR.d} className="fill-muted-foreground" />
    </svg>
  );
}
