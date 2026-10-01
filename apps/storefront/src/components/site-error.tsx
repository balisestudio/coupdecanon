import { Button } from "@coupdecanon/ui/components/button";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Container } from "./container";
import { SiteLink } from "./site-link";

/**
 * What a page shows when it can't load, such as while Medusa can't be reached: the header and
 * the footer stay, the page offers to try again.
 */
export function SiteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center gap-stack pt-block pb-section text-center">
      <h1 className="text-4xl">Un contretemps</h1>
      <p className="max-w-text text-lg">
        Cette page n’a pas pu s’afficher. Réessayez dans un instant ; si cela dure, écrivez-nous ou
        appelez la boutique.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Button
          onClick={() => {
            reset();
            router.invalidate();
          }}
        >
          Réessayer
        </Button>
        <SiteLink href="/" className="link-underline">
          Revenir à l’accueil
        </SiteLink>
      </div>
    </Container>
  );
}
