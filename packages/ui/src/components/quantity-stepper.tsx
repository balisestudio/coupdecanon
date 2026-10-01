import { MinusIcon, PlusIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

/** Its buttons, and a 1px gap and a 1px border: as tall as a small button, or a large one. */
const BUTTON_SIZES = { sm: "size-10", lg: "size-13" } as const;

/**
 * A quantity between a minus and a plus, in a pill as tall as a small button (44px), or a
 * large one (56px). The buttons say what they change for screen readers, from `label`:
 * "Cidre brut : un de moins". Between them, the quantity, or what `children` says of it.
 */
function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  label,
  min = 0,
  max = 99,
  disabled = false,
  size = "sm",
  className,
  children,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** What is counted, for the buttons' accessible names. */
  label: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: keyof typeof BUTTON_SIZES;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="quantity-stepper"
      className={cn(
        "inline-flex items-center rounded-full border border-foreground p-px",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={BUTTON_SIZES[size]}
        aria-label={`${label} : un de moins`}
        disabled={disabled || value <= min}
        onClick={onDecrement}
      >
        <MinusIcon className="size-4" />
      </Button>
      <span className="min-w-6 text-center text-sm font-medium">{children ?? value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={BUTTON_SIZES[size]}
        aria-label={`${label} : un de plus`}
        disabled={disabled || value >= max}
        onClick={onIncrement}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
}

export { QuantityStepper };
