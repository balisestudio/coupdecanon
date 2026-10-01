import {
  QUOTE_INTERESTS,
  type QuoteInterest,
  validateQuoteRequest,
} from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Checkbox } from "@coupdecanon/ui/components/checkbox";
import { Input } from "@coupdecanon/ui/components/input";
import { Label } from "@coupdecanon/ui/components/label";
import { Textarea } from "@coupdecanon/ui/components/textarea";
import { type FormEvent, useId, useState } from "react";
import { botTrapOf } from "../lib/bot-trap";
import { useFieldErrors } from "../lib/form-errors";
import { focusFirstError } from "../lib/form-focus";
import { sendQuoteRequest } from "../lib/forms";
import { BotTrap } from "./bot-trap";
import { FormField } from "./form-field";

const numberOrUndefined = (value: FormDataEntryValue | null) =>
  value && String(value).trim() ? Number(value) : undefined;
const textOrUndefined = (value: FormDataEntryValue | null) =>
  value && String(value).trim() ? String(value) : undefined;

const FAILED = "Votre demande n’a pas pu partir. Réessayez, ou appelez-nous.";

/**
 * The wedding and party quote request. It's checked here before it leaves, field by field,
 * then sent to the estate, which answers by e-mail; the visitor gets a copy.
 */
export function QuoteForm() {
  const id = useId();
  const { errors, setErrors, recheck } = useFieldErrors();
  const [interests, setInterests] = useState<QuoteInterest[]>(["mignonnettes"]);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const read = (form: HTMLFormElement) => {
    const values = new FormData(form);
    return {
      name: values.get("name") ?? "",
      email: values.get("email") ?? "",
      phone: textOrUndefined(values.get("phone")),
      eventDate: textOrUndefined(values.get("eventDate")),
      guests: numberOrUndefined(values.get("guests")),
      miniatures: numberOrUndefined(values.get("miniatures")),
      interests,
      message: textOrUndefined(values.get("message")),
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = validateQuoteRequest(read(form));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(form, result.fields);
      return;
    }
    setErrors({});
    setStatus("sending");
    setFailure(null);
    const outcome = await sendQuoteRequest({
      data: { ...result.data, trap: botTrapOf(values) },
    }).catch(() => ({ sent: false as const, error: FAILED }));
    if (outcome.sent) setSentTo(result.data.email);
    else setFailure(outcome.error);
    setStatus("idle");
  };

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-stack lg:col-span-7 lg:col-start-6">
        <p className="font-serif text-3xl font-medium">Merci, votre demande est partie.</p>
        <p>
          Un e-mail de confirmation vient de partir à {sentTo}. Nous revenons vers vous avec une
          proposition.
        </p>
      </div>
    );
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => recheck(validateQuoteRequest(read(event.currentTarget)))}
      aria-labelledby={`${id}-title`}
      className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:col-start-6"
    >
      <span id={`${id}-title`} className="sr-only">
        Demande de devis
      </span>
      <FormField label="Prénom et nom" error={errors.name}>
        <Input name="name" autoComplete="name" />
      </FormField>
      <FormField label="E-mail" error={errors.email}>
        <Input name="email" type="email" autoComplete="email" />
      </FormField>
      <FormField label="Téléphone" error={errors.phone}>
        <Input name="phone" type="tel" autoComplete="tel" />
      </FormField>
      <FormField label="Date de l’événement" error={errors.eventDate}>
        <Input name="eventDate" type="date" />
      </FormField>
      <FormField label="Nombre d’invités" error={errors.guests}>
        <Input name="guests" type="number" inputMode="numeric" min={1} />
      </FormField>
      <FormField label="Nombre de mignonnettes" error={errors.miniatures}>
        <Input name="miniatures" type="number" inputMode="numeric" min={1} />
      </FormField>
      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="mb-2 text-sm font-medium">Ce qui vous intéresse</legend>
        <div className="flex flex-wrap gap-x-8">
          {(Object.entries(QUOTE_INTERESTS) as [QuoteInterest, string][]).map(([value, label]) => (
            <div key={value} className="flex min-h-11 items-center gap-3">
              <Checkbox
                id={`${id}-${value}`}
                checked={interests.includes(value)}
                onCheckedChange={(checked) =>
                  setInterests((current) =>
                    checked === true
                      ? [...current, value]
                      : current.filter((interest) => interest !== value),
                  )
                }
              />
              <Label htmlFor={`${id}-${value}`} className="font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>
      <FormField label="Votre message" error={errors.message} className="sm:col-span-2">
        <Textarea name="message" rows={5} placeholder="Le lieu, l’ambiance, vos envies" />
      </FormField>
      <BotTrap />
      <div className="flex flex-col items-start gap-3 sm:col-span-2">
        <Button type="submit" size="lg" loading={status === "sending"}>
          Envoyer ma demande
        </Button>
        <p role="status" className="text-sm text-destructive empty:hidden">
          {failure ?? ""}
        </p>
      </div>
    </form>
  );
}
