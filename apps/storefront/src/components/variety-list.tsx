import { cn } from "@coupdecanon/ui/lib/utils";
import { applePath } from "../lib/apple-shape";
import { prng, seedFrom } from "../lib/cutout-shape";

/** Apple skins, from the design's apple colors, bright enough to read on the forest green. */
const APPLE_COLORS = ["fill-apple-yellow", "fill-apple-green", "fill-apple-red"] as const;

type Apple = { d: string; color: (typeof APPLE_COLORS)[number]; rotation: number };

/**
 * One apple per variety, seeded by its name: its own shape, skin and tilt, the same on every
 * visit. Down the list, each skin differs from the one before it.
 */
function applesFor(varieties: string[]) {
  const apples = new Map<string, Apple>();
  let previous: Apple["color"] | undefined;
  for (const variety of varieties) {
    const seed = seedFrom(variety);
    const rand = prng(seed);
    const colors = APPLE_COLORS.filter((color) => color !== previous);
    const color = colors[Math.floor(rand() * colors.length)] ?? APPLE_COLORS[0];
    apples.set(variety, {
      d: applePath({ seed }),
      color,
      rotation: Math.round((rand() - 0.5) * 70),
    });
    previous = color;
  }
  return apples;
}

/** How many columns the list takes: two in the home page's half, three across a page. */
const COLUMNS = {
  2: { grid: "grid-cols-2", count: 2 },
  3: { grid: "grid-cols-2 lg:grid-cols-3", count: 3 },
} as const;

/** Whether an item sits on the list's last row, for a number of columns. */
const onLastRow = (index: number, total: number, columns: number) =>
  index >= total - (total % columns || columns);

/**
 * The orchard's varieties on a grid, read row after row, their rules aligned from one column
 * to the next. Hovering a variety shows its apple beside it: the apples are decoration, drawn
 * within their row, so showing one never moves the page.
 */
export function VarietyList({
  varieties,
  columns = 2,
  size = "text-xl",
  className,
}: {
  varieties: string[];
  columns?: keyof typeof COLUMNS;
  size?: "text-xl" | "text-2xl";
  className?: string;
}) {
  const apples = applesFor(varieties);
  const layout = COLUMNS[columns];

  return (
    <ul aria-label="Nos variétés" className={cn("grid gap-x-grid", layout.grid, className)}>
      {varieties.map((variety, index) => (
        <li
          key={variety}
          className={cn(
            "group relative border-t py-5 pr-12 font-serif font-medium",
            size,
            // The last row closes the grid, on phones' two columns and on desktop's own.
            onLastRow(index, varieties.length, 2) && "max-lg:border-b",
            onLastRow(index, varieties.length, layout.count) && "lg:border-b",
          )}
        >
          {variety}
          <AppleMark apple={apples.get(variety)} />
        </li>
      ))}
    </ul>
  );
}

function AppleMark({ apple }: { apple: Apple | undefined }) {
  if (!apple) return null;
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ rotate: `${apple.rotation}deg` }}
      className={`pointer-events-none absolute inset-y-0 right-0 my-auto size-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${apple.color}`}
    >
      <path d={apple.d} />
    </svg>
  );
}
