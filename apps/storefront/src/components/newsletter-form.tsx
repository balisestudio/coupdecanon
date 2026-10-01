import { validateNewsletter } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { FieldError } from "@coupdecanon/ui/components/field";
import { Input } from "@coupdecanon/ui/components/input";
import { cn } from "@coupdecanon/ui/lib/utils";
import { type ChangeEvent, type FormEvent, useId, useState } from "react";
import { botTrapOf } from "../lib/bot-trap";
import { subscribeToNewsletter } from "../lib/forms";
import { BotTrap } from "./bot-trap";

const validate = (value: string) => {
  const result = validateNewsletter({ email: value });
  return result.ok ? null : result.error;
};

/**
 * The estate's letter, from the footer, in the words the team writes in Payload. The address
 * is checked here, so the error shows on the field itself, then Medusa keeps it: the customer
 * with that address, or a new one without an account, is marked as receiving the letter, as
 * the account's own setting does.
 */
export function NewsletterForm({
  title,
  text,
  note,
  className,
}: {
  title: string;
  text?: string | null;
  note?: string | null;
  className?: string;
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [error, setError] = useState<string | null>(null);
  // Errors show from the first submit on, then update as the visitor types.
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "subscribed">("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("email") as HTMLInputElement;
    const message = validate(input.value);
    setAttempted(true);
    setError(message);
    if (message) {
      input.focus();
      return;
    }
    setStatus("sending");
    const outcome = await subscribeToNewsletter({
      data: { email: input.value, trap: botTrapOf(new FormData(form)) },
    }).catch(() => ({
      sent: false as const,
      error: "L’inscription n’a pas abouti. Réessayez dans un instant.",
    }));
    if (outcome.sent) {
      setStatus("subscribed");
      return;
    }
    setError(outcome.error);
    setStatus("idle");
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (attempted) setError(validate(event.target.value));
  };

  return (
    <section aria-labelledby={`${inputId}-title`} className={cn("flex flex-col gap-4", className)}>
      <h2 id={`${inputId}-title`} className="text-3xl">
        {title}
      </h2>
      {text ? <p className="text-muted-foreground">{text}</p> : null}
      {status === "subscribed" ? (
        <p role="status" className="font-serif text-xl font-medium">
          C’est noté : la prochaine lettre du domaine sera pour vous.
        </p>
      ) : (
        <form
          method="post"
          noValidate
          onSubmit={onSubmit}
          className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <label htmlFor={inputId} className="sr-only">
            Votre adresse e-mail
          </label>
          <Input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Votre adresse e-mail"
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={onChange}
            className="grow"
          />
          <BotTrap />
          <Button type="submit" loading={status === "sending"}>
            S’inscrire
          </Button>
        </form>
      )}
      <FieldError id={errorId}>{error}</FieldError>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </section>
  );
}
