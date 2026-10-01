import type { ReactNode } from "react";
import { Container } from "./container";

/** A page's opening: its title in large, its introduction beneath, both centered. */
export function CenteredHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Container className="flex flex-col items-center gap-stack pt-block text-center">
      <h1 className="text-4xl">{title}</h1>
      {children ? <p className="max-w-text text-lg">{children}</p> : null}
    </Container>
  );
}

/** A page's opening: its title in large, its introduction beneath, aligned left. */
export function PageHero({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Container className="flex flex-col gap-stack py-block">
      <h1 className="text-4xl">{title}</h1>
      {children ? <p className="max-w-text text-lg">{children}</p> : null}
    </Container>
  );
}
