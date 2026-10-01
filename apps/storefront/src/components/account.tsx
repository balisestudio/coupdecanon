import { Badge } from "@coupdecanon/ui/components/badge";
import { Button } from "@coupdecanon/ui/components/button";
import { cn } from "@coupdecanon/ui/lib/utils";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import type { AccountOrder } from "../lib/account";
import { logOutCustomer } from "../lib/account";
import { PATHS } from "../lib/paths";
import { useCart } from "./cart";
import { Container } from "./container";
import { SiteLink } from "./site-link";

/** The account's sections; an order's page belongs to the orders. */
const SECTIONS = [
  {
    href: PATHS.account,
    label: "Mes commandes",
    matches: (path: string) =>
      path === PATHS.account || path.startsWith(`${PATHS.account}/orders/`),
  },
  {
    href: PATHS.accountDetails,
    label: "Mes informations",
    matches: (path: string) => path === PATHS.accountDetails,
  },
];

/** Signs out, then back to the sign-in page: the button turns while it works. */
function LogOut() {
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={pending}
      className="self-start"
      onClick={async () => {
        setPending(true);
        try {
          await logOutCustomer();
          await refresh();
          navigate({ to: "/account/sign-in" });
        } finally {
          setPending(false);
        }
      }}
    >
      Se déconnecter
    </Button>
  );
}

/** An account page: a greeting, the account's sections and the way out, the section's content. */
export function AccountLayout({
  firstName,
  title,
  children,
}: {
  firstName: string;
  /** The section's title, beside the menu. */
  title: string;
  children: ReactNode;
}) {
  const path = useLocation({ select: (location) => location.pathname });

  return (
    <div className="pb-section">
      <Container className="flex flex-col gap-stack py-block">
        <h1 className="text-4xl">{firstName ? `Bonjour ${firstName}` : "Votre compte"}</h1>
        <p className="max-w-text text-lg">Suivez vos commandes et gérez vos informations.</p>
      </Container>
      <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <div className="flex flex-col gap-stack lg:col-span-3">
          <nav aria-label="Mon compte" className="flex flex-col gap-1">
            {SECTIONS.map((section) => {
              const active = section.matches(path);
              return (
                // The current section stays filled, hovered or not.
                <Button
                  key={section.href}
                  asChild
                  variant={active ? "default" : "ghost"}
                  className={cn("justify-start px-6 font-normal", active && "hover:bg-primary")}
                >
                  <SiteLink href={section.href} activeOptions={{ exact: true }}>
                    {section.label}
                  </SiteLink>
                </Button>
              );
            })}
          </nav>
          <LogOut />
        </div>
        <section
          aria-labelledby="compte-section"
          className="flex flex-col gap-stack lg:col-span-8 lg:col-start-5"
        >
          <h2 id="compte-section" className="text-3xl">
            {title}
          </h2>
          {children}
        </section>
      </Container>
    </div>
  );
}

/**
 * Where an order stands, alike everywhere: the same pill for every status, a dot of its own
 * color. Live statuses get a strong dot, the ready one the brand's green; a closed one a
 * soft dot; a canceled one the error's red.
 */
const STATUSES: Record<AccountOrder["status"], { label: string; dot: string }> = {
  preparing: { label: "En préparation", dot: "bg-muted-foreground" },
  ready: { label: "Prête au retrait", dot: "bg-primary" },
  collected: { label: "Retirée", dot: "bg-input/40" },
  canceled: { label: "Annulée", dot: "bg-destructive" },
};

export function OrderStatus({ status }: { status: AccountOrder["status"] }) {
  const { label, dot } = STATUSES[status];
  return (
    <Badge variant="secondary" className="gap-2">
      <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      {label}
    </Badge>
  );
}

/** "29 septembre 2026". */
export const formatOrderDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(
    new Date(date),
  );
