import type { FieldErrors } from "@coupdecanon/config/forms";

/**
 * Takes the customer to the first field to fix, in the form's order, as the browser would for
 * its own checks: a screen reader then reads the field and its error.
 */
export function focusFirstError(form: HTMLFormElement, errors: FieldErrors) {
  const fields = Object.keys(errors);
  const first = [...form.elements].find(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      fields.includes(element.getAttribute("name") ?? element.id.split("-").pop() ?? ""),
  );
  first?.focus();
}
