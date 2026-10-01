import { Field, FieldDescription, FieldError, FieldLabel } from "@coupdecanon/ui/components/field";
import type { ReactElement, ReactNode } from "react";
import { cloneElement, useId } from "react";

/**
 * A labelled form control with its note or its error beneath, from shadcn's field: the
 * control gets its id, and points at the note, or at the error while there is one.
 */
export function FormField({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: ReactNode;
  error?: string;
  /** A note under the control, such as what a password needs. */
  hint?: ReactNode;
  className?: string;
  children: ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && !error ? <FieldDescription id={hintId}>{hint}</FieldDescription> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
