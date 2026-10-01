import type * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

/**
 * An input with something inside its pill, such as an icon or a button at its end. The pill
 * lights up while its input has the focus, and not while its button has it.
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "relative flex h-13 w-full min-w-0 items-center rounded-full border border-input transition",
        "has-control-focus:border-ring has-control-focus:ring-3 has-control-focus:ring-ring/50",
        "has-control-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent pr-2 focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

/** What sits at the input's end: an icon, a word, a button. */
function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn("flex shrink-0 items-center pr-1 text-muted-foreground", className)}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  variant = "ghost",
  size = "icon",
  type = "button",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="input-group-button"
      type={type}
      variant={variant}
      size={size}
      className={cn("size-11 text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput };
