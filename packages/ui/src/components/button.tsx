import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap press-scale outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-background hover:bg-destructive/90",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "h-auto rounded-none px-0 text-foreground link-underline",
      },
      size: {
        sm: "h-11 px-5 text-sm",
        default: "h-13 px-8 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * A button. While `loading`, a spinner takes its label's place: the label stays, unseen, so
 * the button keeps its size and its name, and the button refuses clicks without losing the
 * focus, as a disabled one would.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const attributes = {
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    className: cn(
      buttonVariants({ variant, size, className }),
      loading && "relative cursor-progress",
    ),
  };

  if (asChild) {
    return (
      <Slot.Root {...attributes} onClick={onClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      {...attributes}
      aria-busy={loading || undefined}
      aria-disabled={loading || props["aria-disabled"]}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center gap-2 opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner role="presentation" aria-label={undefined} aria-hidden="true" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button, buttonVariants };
