import { validateChangePassword, validateProfile } from "@coupdecanon/config/forms";
import { Button } from "@coupdecanon/ui/components/button";
import { Input } from "@coupdecanon/ui/components/input";
import { Switch } from "@coupdecanon/ui/components/switch";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { AccountLayout } from "../../components/account";
import { FormField } from "../../components/form-field";
import { NewPasswordField } from "../../components/new-password-field";
import { PasswordInput } from "../../components/password-input";
import { changePassword, getAccountDetails, setNewsletter, updateProfile } from "../../lib/account";
import { useFieldErrors, valuesOf } from "../../lib/form-errors";
import { focusFirstError } from "../../lib/form-focus";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/account/details")({
  loader: () => getAccountDetails(),
  head: () => ({
    meta: [
      { title: pageTitle("Mes informations") },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Details,
});

/** A part of the page, under its title. */
function Part({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h3 id={id} className="text-2xl">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** What a form says once sent: that it's done, or that it failed. */
function Outcome({ status }: { status: "idle" | "saving" | "saved" | "failed" }) {
  return (
    <p role="status" className="text-sm empty:hidden">
      {status === "saved" ? "C’est enregistré." : ""}
      {status === "failed" ? (
        <span className="text-destructive">L’enregistrement n’a pas abouti.</span>
      ) : null}
    </p>
  );
}

function Profile() {
  const { customer } = Route.useLoaderData();
  const router = useRouter();
  const { errors, setErrors, recheck } = useFieldErrors();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateProfile(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(event.currentTarget, result.fields);
      return;
    }
    setErrors({});
    setStatus("saving");
    try {
      await updateProfile({ data: result.data });
      await router.invalidate();
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => recheck(validateProfile(valuesOf(event.currentTarget)))}
      className="grid gap-5 sm:grid-cols-2"
    >
      <FormField label="Prénom" error={errors.firstName}>
        <Input name="firstName" autoComplete="given-name" defaultValue={customer.firstName} />
      </FormField>
      <FormField label="Nom" error={errors.lastName}>
        <Input name="lastName" autoComplete="family-name" defaultValue={customer.lastName} />
      </FormField>
      <FormField label="E-mail" hint="Pour la changer, écrivez-nous.">
        <Input value={customer.email} readOnly disabled />
      </FormField>
      <FormField label="Téléphone" error={errors.phone}>
        <Input name="phone" type="tel" autoComplete="tel" defaultValue={customer.phone} />
      </FormField>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" loading={status === "saving"}>
          Enregistrer
        </Button>
        <Outcome status={status} />
      </div>
    </form>
  );
}

/** The password changes with the current one: no e-mail needed. */
function Password() {
  const { errors, setErrors, recheck } = useFieldErrors();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [failure, setFailure] = useState<string | null>(null);
  // A new form once the password changed, emptied.
  const [round, setRound] = useState(0);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateChangePassword(Object.fromEntries(new FormData(form)));
    if (!result.ok) {
      setErrors(result.fields);
      focusFirstError(form, result.fields);
      return;
    }
    setErrors({});
    setFailure(null);
    setStatus("saving");
    const outcome = await changePassword({ data: result.data }).catch(
      () =>
        ({
          ok: false,
          field: null,
          error: "Le mot de passe n’a pas pu être changé. Réessayez.",
        }) as const,
    );
    if (outcome.ok) {
      setStatus("saved");
      setRound((current) => current + 1);
      return;
    }
    setStatus("idle");
    if (outcome.field) {
      setErrors({ [outcome.field]: outcome.error });
      focusFirstError(form, { [outcome.field]: outcome.error });
    } else {
      setFailure(outcome.error);
    }
  };

  return (
    <form
      key={round}
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => recheck(validateChangePassword(valuesOf(event.currentTarget)))}
      className="grid gap-5 sm:grid-cols-2"
    >
      <FormField label="Mot de passe actuel" error={errors.currentPassword}>
        <PasswordInput name="currentPassword" autoComplete="current-password" />
      </FormField>
      <NewPasswordField
        name="newPassword"
        label="Nouveau mot de passe"
        error={errors.newPassword}
      />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" loading={status === "saving"}>
          Changer le mot de passe
        </Button>
        <p role="status" className="text-sm empty:hidden">
          {status === "saved" ? "Votre mot de passe est changé." : ""}
          {failure ? <span className="text-destructive">{failure}</span> : null}
        </p>
      </div>
    </form>
  );
}

function Newsletter() {
  const { customer } = Route.useLoaderData();
  const id = useId();
  const [checked, setChecked] = useState(customer.newsletter);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={async (value) => {
            setChecked(value);
            setFailed(false);
            await setNewsletter({ data: { subscribed: value } }).catch(() => {
              setChecked(!value);
              setFailed(true);
            });
          }}
        />
        <label htmlFor={id}>Recevoir la lettre du domaine</label>
      </div>
      <p className="text-sm text-muted-foreground">
        Une lettre quand une cuvée sort de la cave, et rien de plus.
      </p>
      {failed ? (
        <p role="status" className="text-sm text-destructive">
          Le réglage n’a pas pu être enregistré.
        </p>
      ) : null}
    </div>
  );
}

function Details() {
  const { customer } = Route.useLoaderData();

  return (
    <AccountLayout firstName={customer.firstName} title="Mes informations">
      <div className="flex max-w-dialog flex-col gap-block">
        <Profile />
        <Part title="Mot de passe">
          <Password />
        </Part>
        <Part title="Lettre du domaine">
          <Newsletter />
        </Part>
      </div>
    </AccountLayout>
  );
}
