import type { FieldErrors } from "@coupdecanon/config/forms";
import { useCallback, useState } from "react";

/** What a form's check gives: its values, or what to fix, field by field. */
type Check = { ok: true } | { ok: false; fields: FieldErrors };

/**
 * A form's errors, by field. Once a submit has shown some, each one goes as soon as its field
 * is fixed, without waiting for the next submit; typing never brings new ones up.
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState<FieldErrors>({});

  const recheck = useCallback((check: Check) => {
    setErrors((current) => {
      const shown = Object.keys(current);
      if (!shown.length) return current;
      const failing = check.ok ? {} : check.fields;
      return Object.fromEntries(
        shown.flatMap((field) => (failing[field] ? [[field, failing[field]]] : [])),
      );
    });
  }, []);

  return { errors, setErrors, recheck };
}

/** A form's fields, as text, for its check. */
export const valuesOf = (form: HTMLFormElement) => Object.fromEntries(new FormData(form));
