import { validateLogin } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Input } from "@coupdecanon/ui/components/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { parseAsString } from "nuqs/server";
import { type FormEvent, useState } from "react";
import { useCart } from "../../components/cart";
import { Container } from "../../components/container";
import { FormField } from "../../components/form-field";
import { PasswordInput } from "../../components/password-input";
import { getLoginPage, logInCustomer } from "../../lib/account";
import { useFieldErrors, valuesOf } from "../../lib/form-errors";
import { focusFirstError } from "../../lib/form-focus";
import { PATHS } from "../../lib/paths";
import { searchSchema } from "../../lib/search-params";
import { pageMeta, pageTitle } from "../../lib/seo";

/** Where signing in leads back to, `?next=/checkout`: the account, when nothing says. */
export const nextSearch = searchSchema({ next: parseAsString });

/** Only this site's own pages can be where a sign-in leads back to. */
export const safeReturn = (path: string | undefined | null) =>
  path?.startsWith("/") && !path.startsWith("//") ? path : PATHS.account;

export const Route = createFileRoute("/_site/account/sign-in")({
  validateSearch: nextSearch,
  loader: () => getLoginPage(),
  head: () => ({
    meta: [
      ...pageMeta({
        siteUrl: "",
        path: PATHS.login,
        title: pageTitle("Se connecter"),
        description: "Retrouvez vos commandes et vos informations.",
        noindex: true,
      }).meta,
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const { errors, setErrors, recheck } = useFieldErrors();
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateLogin(Object.fromEntries(new FormData(form)));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(form, result.fields);
      return;
    }
    setErrors({});
    setSending(true);
    const outcome = await logInCustomer({ data: result.data }).catch(
      () => ({ ok: false, error: "La connexion n’a pas abouti. Réessayez." }) as const,
    );
    if (outcome.ok) {
      await refresh();
      navigate({ href: safeReturn(next) });
      return;
    }
    setSending(false);
    // Whichever of the two was wrong, the answer is the same, under the address.
    setErrors({ email: outcome.error });
    focusFirstError(form, { email: outcome.error });
  };

  return (
    <Container className="flex flex-col gap-block pt-block pb-section lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
      <div className="flex flex-col gap-stack lg:col-span-5">
        <h1 className="text-4xl">Votre compte</h1>
        <p className="max-w-text text-lg">Retrouvez vos commandes et vos informations.</p>
        <form
          method="post"
          noValidate
          onSubmit={onSubmit}
          onChange={(event) => recheck(validateLogin(valuesOf(event.currentTarget)))}
          className="flex flex-col gap-5 pt-stack"
        >
          <FormField label="E-mail" error={errors.email}>
            <Input name="email" type="email" autoComplete="email" />
          </FormField>
          <FormField label="Mot de passe" error={errors.password}>
            <PasswordInput name="password" autoComplete="current-password" />
          </FormField>
          <Link to="/account/forgot-password" className="self-end text-sm link-underline">
            Mot de passe oublié ?
          </Link>
          <Button type="submit" size="lg" loading={sending}>
            Se connecter
          </Button>
        </form>
      </div>
      <section
        aria-labelledby="premiere-titre"
        className="flex flex-col gap-stack bg-card p-8 lg:col-span-6 lg:col-start-7 lg:p-16"
      >
        <h2 id="premiere-titre" className="text-3xl">
          Première commande ?
        </h2>
        <p className="max-w-text">
          Créez un compte pour suivre vos commandes et commander à nouveau en un geste.
        </p>
        <Button asChild variant="outline" className="self-start">
          <Link to="/account/sign-up" search={{ next }}>
            Créer un compte
          </Link>
        </Button>
        <p className="pt-stack">
          Vous pouvez aussi commander sans compte, depuis{" "}
          <Link to="/basket" className="link-underline">
            votre panier
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
