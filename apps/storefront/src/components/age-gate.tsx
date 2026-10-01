import { Button } from "@coupdecanon/ui/components/button";
import { Checkbox } from "@coupdecanon/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@coupdecanon/ui/components/dialog";
import { Label } from "@coupdecanon/ui/components/label";
import { Logo } from "@coupdecanon/ui/components/logo";
import { useEffect, useId, useState } from "react";
import type { LayoutData } from "../lib/layout";
import { Arch } from "./arch";
import { Photo } from "./photo";

/**
 * The visitor's answer, in a cookie: every tab of the visit shares it, such as a page opened
 * from an e-mail. Without "Se souvenir de moi", it lasts until the browser closes.
 */
const COOKIE = "cdc_age";
const REMEMBERED_FOR = 60 * 60 * 24 * 365;

const isVerified = () => document.cookie.split("; ").includes(`${COOKIE}=1`);

function rememberVerified(onThisDevice: boolean) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  const maxAge = onThisDevice ? `; Max-Age=${REMEMBERED_FOR}` : "";
  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API isn't in every browser yet
  document.cookie = `${COOKIE}=1; Path=/; SameSite=Lax${maxAge}${secure}`;
}

/**
 * Asks visitors to confirm they're of age before they browse, as the sale of alcohol
 * requires. The dialog can't be dismissed without answering. It only opens in the browser,
 * after hydration: the server's HTML, which search engines index, carries the page alone.
 * Search engines also exempt interstitials that a legal obligation such as this one imposes.
 */
export function AgeGate({ content }: { content: LayoutData["ageGate"] }) {
  const rememberId = useId();
  const [open, setOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (!isVerified()) setOpen(true);
  }, []);

  const confirm = () => {
    rememberVerified(remember);
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        overlayClassName="bg-background/60 backdrop-blur-md"
        className="dark max-w-dialog gap-0 border-0 bg-background p-6 text-foreground md:grid-cols-12 md:gap-x-grid md:p-8"
      >
        <Arch name="age-gate" className="h-40 md:col-span-5 md:aspect-portrait md:h-auto">
          <Photo
            media={content.photo}
            sizes="(min-width: 768px) 20rem, 100vw"
            className="size-full"
          />
        </Arch>
        <div className="flex flex-col pt-6 md:col-span-7 md:pt-0">
          <Logo className="h-12 w-auto self-start md:h-14" />
          <DialogTitle className="mt-8 text-3xl">{content.title}</DialogTitle>
          <DialogDescription className="mt-4 text-base text-muted-foreground">
            {content.text}
          </DialogDescription>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={confirm}>
              J’ai 18 ans ou plus
            </Button>
            {/* Minors go back where they came from, even off the site. */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                // Back where they came from; arriving here first, there's nowhere to go back to.
                if (window.history.length > 1) window.history.back();
                else setRefused(true);
              }}
            >
              Je n’ai pas 18 ans
            </Button>
          </div>
          <p role="status" className="mt-3 text-sm empty:hidden">
            {refused ? "Ce site est réservé aux personnes majeures. À bientôt !" : ""}
          </p>
          <div className="mt-3 flex min-h-11 items-center gap-3">
            <Checkbox
              id={rememberId}
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <Label htmlFor={rememberId} className="font-normal text-muted-foreground">
              Se souvenir de moi sur cet appareil
            </Label>
          </div>

          <p className="mt-6 text-xs text-muted-foreground md:mt-auto md:pt-8">
            {content.healthWarning}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
