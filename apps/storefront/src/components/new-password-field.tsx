import { PASSWORD_RULES } from "@coupdecanon/config/forms";
import { Field, FieldError, FieldLabel } from "@coupdecanon/ui/components/field";
import { cn } from "@coupdecanon/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";
import { PasswordInput } from "./password-input";

/**
 * A new password's field, with what it needs listed beneath: each part is ticked as the
 * password meets it, so the customer knows what's left before sending.
 */
export function NewPasswordField({
  name = "password",
  label = "Mot de passe",
  error,
  className,
}: {
  name?: string;
  label?: string;
  error?: string;
  className?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <PasswordInput
        id={id}
        name={name}
        autoComplete="new-password"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-rules${error ? ` ${id}-error` : ""}`}
      />
      <ul id={`${id}-rules`} className="flex flex-wrap gap-x-4 gap-y-1 px-6 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1 transition-colors",
                met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <CheckIcon
                aria-hidden="true"
                className={cn("size-3 transition-opacity", met ? "opacity-100" : "opacity-30")}
              />
              {rule.label}
              <span className="sr-only">{met ? ", fait" : ", à faire"}</span>
            </li>
          );
        })}
      </ul>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  );
}
