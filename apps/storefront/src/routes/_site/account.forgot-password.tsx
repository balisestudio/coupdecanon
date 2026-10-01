import { validateForgotPassword } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Input } from "@coupdecanon/ui/components/input";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { BotTrap } from "../../components/bot-trap";
import { Container } from "../../components/container";
import { FormField } from "../../components/form-field";
import { requestPasswordReset } from "../../lib/account";
import { botTrapOf } from "../../lib/bot-trap";
import { useFieldErrors, valuesOf } from "../../lib/form-errors";
import { focusFirstError } from "../../lib/form-focus";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/account/forgot-password")({
  head: () => ({
    meta: [
      { title: pageTitle("Mot de passe oublié") },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { errors, setErrors, recheck } = useFieldErrors();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const result = validateForgotPassword(Object.fromEntries(values));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(event.currentTarget, result.fields);
      return;
    }
    setSending(true);
    setFailure(null);
    const outcome = await requestPasswordReset({
      data: { ...result.data, trap: botTrapOf(values) },
    }).catch(() => ({ ok: true }) as const);
    setSending(false);
    if (outcome.ok) setSentTo(result.data.email);
    else setFailure(outcome.error);
  };

  return (
    <Container className="flex flex-col gap-stack pt-block pb-section">
      <h1 className="text-4xl">Mot de passe oublié</h1>
      {sentTo ? (
        <p role="status" className="max-w-text text-lg">
          Si un compte existe pour {sentTo}, un e-mail vient d’y partir avec un lien pour choisir un
          nouveau mot de passe. Il est valable 15 minutes.
        </p>
      ) : (
        <>
          <p className="max-w-text text-lg">
            Indiquez l’adresse de votre compte : nous vous envoyons un lien pour choisir un nouveau
            mot de passe.
          </p>
          <form
            method="post"
            noValidate
            onSubmit={onSubmit}
            onChange={(event) => recheck(validateForgotPassword(valuesOf(event.currentTarget)))}
            className="flex max-w-text flex-col gap-5 pt-stack"
          >
            <FormField label="E-mail" error={errors.email}>
              <Input name="email" type="email" autoComplete="email" />
            </FormField>
            <BotTrap />
            <Button type="submit" size="lg" loading={sending}>
              Recevoir le lien
            </Button>
            <p role="status" className="text-sm text-destructive empty:hidden">
              {failure ?? ""}
            </p>
          </form>
        </>
      )}
    </Container>
  );
}
