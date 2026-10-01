import { formatHours, type ShopHours } from "@coupdecanon/config/shop-info";
import { cn } from "@coupdecanon/ui/lib/utils";

/**
 * The shop's opening hours, as the team set them in the admin, days with the same hours
 * together: "Du mardi au vendredi · 10 h – 12 h 30 et 14 h – 18 h".
 */
export function OpeningHours({ hours, className }: { hours: ShopHours; className?: string }) {
  const lines = formatHours(hours);
  if (!lines.length) return null;
  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {lines.map((line) => (
        <li key={line.days}>
          {line.days}
          {" : "}
          <span>{line.times}</span>
        </li>
      ))}
    </ul>
  );
}
