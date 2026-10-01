import { validateResetPassword } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { parseAsString } from "nuqs/server";
import { type FormEvent, useState } from "react";
import { useCart } from "../../components/cart";
import { Container } from "../../components/container";
import { NewPasswordField } from "../../components/new-password-field";
import { resetPassword } from "../../lib/account";
import { useFieldErrors, valuesOf } from "../../lib/form-errors";
import { focusFirstError } from "../../lib/form-focus";
import { searchSchema } from "../../lib/search-params";
import { pageTitle } from "../../lib/seo";

/** The link in the e-mail carries these technical parameters. */
const resetSearch = searchSchema({ token: parseAsString, email: parseAsString });

export const Route = createFileRoute("/_site/account/reset-password")({
  validateSearch: resetSearch,
  head: () => ({
    meta: [
      { title: pageTitle("Nouveau mot de passe") },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const { errors, setErrors, recheck } = useFieldErrors();
  const [status, setStatus] = useState<{ sending: boolean; error: string | null }>({
    sending: false,
    error: null,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const result = validateResetPassword({ email, token, password: values.get("password") });
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(event.currentTarget, result.fields);
      if (result.fields.token || result.fields.email) {
        setStatus({ sending: false, error: "Ce lien n’est pas valide. Demandez-en un nouveau." });
      }
      return;
    }
    setStatus({ sending: true, error: null });
    const outcome = await resetPassword({ data: result.data });
    if (outcome.ok) {
      await refresh();
      navigate({ to: "/account" });
      return;
    }
    setStatus({ sending: false, error: outcome.error });
  };

  return (
    <Container className="flex flex-col gap-stack pt-block pb-section">
      <h1 className="text-4xl">Nouveau mot de passe</h1>
      <p className="max-w-text text-lg">
        {email ? `Pour le compte ${email}.` : "Choisissez votre nouveau mot de passe."}
      </p>
      <form
        method="post"
        noValidate
        onSubmit={onSubmit}
        onChange={(event) =>
          recheck(
            validateResetPassword({
              email,
              token,
              password: valuesOf(event.currentTarget).password,
            }),
          )
        }
        className="flex max-w-text flex-col gap-5 pt-stack"
      >
        <NewPasswordField label="Nouveau mot de passe" error={errors.password} />
        <Button type="submit" size="lg" loading={status.sending}>
          Enregistrer et me connecter
        </Button>
        {status.error ? (
          <p role="status" className="text-sm text-destructive">
            {status.error}{" "}
            <Link to="/account/forgot-password" className="text-foreground link-underline">
              Demander un nouveau lien
            </Link>
          </p>
        ) : null}
      </form>
    </Container>
  );
}
