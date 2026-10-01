import {
  CONTACT_SUBJECTS,
  type ContactSubject,
  validateContactMessage,
} from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Input } from "@coupdecanon/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@coupdecanon/ui/components/select";
import { Textarea } from "@coupdecanon/ui/components/textarea";
import { type FormEvent, useState } from "react";
import { botTrapOf } from "../lib/bot-trap";
import { useFieldErrors } from "../lib/form-errors";
import { focusFirstError } from "../lib/form-focus";
import { sendContactMessage } from "../lib/forms";
import { BotTrap } from "./bot-trap";
import { FormField } from "./form-field";

const FAILED = "Votre message n’a pas pu partir. Réessayez, ou appelez-nous.";

/** The help page's message form, checked field by field, then sent to the estate. */
export function ContactForm() {
  const { errors, setErrors, recheck } = useFieldErrors();
  const [subject, setSubject] = useState<ContactSubject>("commande");
  const read = (form: HTMLFormElement) => {
    const values = new FormData(form);
    return {
      name: values.get("name") ?? "",
      email: values.get("email") ?? "",
      subject,
      message: values.get("message") ?? "",
    };
  };
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [failure, setFailure] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = validateContactMessage(read(form));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(form, result.fields);
      return;
    }
    setErrors({});
    setStatus("sending");
    setFailure(null);
    const outcome = await sendContactMessage({
      data: { ...result.data, trap: botTrapOf(values) },
    }).catch(() => ({ sent: false as const, error: FAILED }));
    if (outcome.sent) {
      setStatus("sent");
      return;
    }
    setFailure(outcome.error);
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <p role="status" className="font-serif text-2xl font-medium">
        Merci, votre message est parti. Nous vous répondons par e-mail.
      </p>
    );
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => recheck(validateContactMessage(read(event.currentTarget)))}
      className="flex flex-col gap-5"
    >
      <FormField label="Nom" error={errors.name}>
        <Input name="name" autoComplete="name" />
      </FormField>
      <FormField label="E-mail" error={errors.email}>
        <Input name="email" type="email" autoComplete="email" />
      </FormField>
      <FormField label="Sujet" error={errors.subject}>
        <Select value={subject} onValueChange={(value) => setSubject(value as ContactSubject)}>
          <SelectTrigger className="w-full">
            <SelectValue>{CONTACT_SUBJECTS[subject]}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={8}>
            {Object.entries(CONTACT_SUBJECTS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Message" error={errors.message}>
        <Textarea name="message" rows={5} />
      </FormField>
      <BotTrap />
      <Button type="submit" size="lg" loading={status === "sending"}>
        Envoyer
      </Button>
      <p role="status" className="text-sm text-destructive empty:hidden">
        {failure ?? ""}
      </p>
    </form>
  );
}
