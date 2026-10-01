import { validateRegister } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Checkbox } from "@coupdecanon/ui/components/checkbox";
import { FieldError } from "@coupdecanon/ui/components/field";
import { Input } from "@coupdecanon/ui/components/input";
import { Label } from "@coupdecanon/ui/components/label";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useId, useState } from "react";
import { BotTrap } from "../../components/bot-trap";
import { useCart } from "../../components/cart";
import { Container } from "../../components/container";
import { FormField } from "../../components/form-field";
import { NewPasswordField } from "../../components/new-password-field";
import { getLoginPage, registerCustomer } from "../../lib/account";
import { botTrapOf } from "../../lib/bot-trap";
import { useFieldErrors, valuesOf } from "../../lib/form-errors";
import { focusFirstError } from "../../lib/form-focus";
import { PATHS } from "../../lib/paths";
import { pageMeta, pageTitle } from "../../lib/seo";
import { nextSearch, safeReturn } from "./account.sign-in";

export const Route = createFileRoute("/_site/account/sign-up")({
  validateSearch: nextSearch,
  loader: () => getLoginPage(),
  head: () => ({
    meta: pageMeta({
      siteUrl: "",
      path: PATHS.register,
      title: pageTitle("Créer un compte"),
      description: "Créez votre compte pour suivre vos commandes.",
      noindex: true,
    }).meta,
  }),
  component: Register,
});

function Register() {
  const id = useId();
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [newsletter, setNewsletter] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { errors, setErrors, recheck } = useFieldErrors();
  const [status, setStatus] = useState<{ sending: boolean; error: string | null }>({
    sending: false,
    error: null,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const result = validateRegister({ ...Object.fromEntries(values), newsletter, termsAccepted });
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(form, result.fields);
      return;
    }
    setErrors({});
    setStatus({ sending: true, error: null });
    const outcome = await registerCustomer({
      data: { ...result.data, trap: botTrapOf(values) },
    }).catch(() => ({ ok: false, error: "Le compte n’a pas pu être créé. Réessayez." }) as const);
    if (outcome.ok) {
      await refresh();
      navigate({ href: safeReturn(next) });
      return;
    }
    setStatus({ sending: false, error: outcome.error });
  };

  return (
    <Container className="flex flex-col gap-stack pt-block pb-section">
      <h1 className="text-4xl">Créer un compte</h1>
      <p className="max-w-text text-lg">
        Pour suivre vos commandes et commander à nouveau en un geste.
      </p>
      <form
        method="post"
        noValidate
        onSubmit={onSubmit}
        onChange={(event) =>
          recheck(validateRegister({ ...valuesOf(event.currentTarget), newsletter, termsAccepted }))
        }
        className="grid max-w-dialog gap-5 pt-stack sm:grid-cols-2"
      >
        <FormField label="Prénom" error={errors.firstName}>
          <Input name="firstName" autoComplete="given-name" />
        </FormField>
        <FormField label="Nom" error={errors.lastName}>
          <Input name="lastName" autoComplete="family-name" />
        </FormField>
        <FormField label="E-mail" error={errors.email} className="sm:col-span-2">
          <Input name="email" type="email" autoComplete="email" />
        </FormField>
        <NewPasswordField error={errors.password} className="sm:col-span-2" />
        <div className="flex flex-col gap-2 pt-2 sm:col-span-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${id}-termsAccepted`}
              checked={termsAccepted}
              onCheckedChange={(value) => {
                setTermsAccepted(value === true);
                // Accepted: its error goes, as a fixed field's does.
                if (value === true) setErrors(({ termsAccepted: _, ...others }) => others);
              }}
              aria-invalid={errors.termsAccepted ? true : undefined}
              aria-describedby={errors.termsAccepted ? `${id}-terms-error` : undefined}
              className="mt-px"
            />
            <Label htmlFor={`${id}-termsAccepted`} className="block font-normal">
              J’accepte les{" "}
              <a href={PATHS.termsOfUse} target="_blank" rel="noopener noreferrer">
                conditions générales d’utilisation
                <span className="sr-only"> (nouvel onglet)</span>
              </a>{" "}
              et reconnais avoir pris connaissance de la{" "}
              <a href={PATHS.privacy} target="_blank" rel="noopener noreferrer">
                politique de confidentialité
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
              .
            </Label>
          </div>
          <FieldError id={`${id}-terms-error`} className="pl-8">
            {errors.termsAccepted}
          </FieldError>
        </div>
        <div className="flex items-start gap-3 sm:col-span-2">
          <Checkbox
            id={`${id}-newsletter`}
            checked={newsletter}
            onCheckedChange={(value) => setNewsletter(value === true)}
            className="mt-px"
          />
          <Label htmlFor={`${id}-newsletter`} className="block font-normal">
            Recevoir la lettre du domaine, quand une cuvée sort de la cave
          </Label>
        </div>
        <div className="flex flex-col items-start gap-3 pt-2 sm:col-span-2">
          <BotTrap />
          <Button type="submit" size="lg" loading={status.sending}>
            Créer mon compte
          </Button>
          <p role="status" className="text-sm text-destructive empty:hidden">
            {status.error ?? ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              to="/account/sign-in"
              search={{ next }}
              className="font-medium text-foreground link-underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </Container>
  );
}
