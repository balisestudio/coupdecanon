import type * as React from "react";
import { cn } from "../lib/utils";
import { Label } from "./label";

/** A form control with its label, and its description or error beneath. */
function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field" className={cn("flex w-full flex-col gap-2", className)} {...props} />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("w-fit", className)} {...props} />;
}

/** A note under the control; it leaves the pill's rounded edge some room. */
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("px-6 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** What is wrong with the control's value, announced as it appears. */
function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("px-6 text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/** A group of choices under a legend, such as checkboxes. */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset data-slot="field-set" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("mb-3 text-sm font-medium", className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet };
