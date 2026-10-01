import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Where short messages appear, at the bottom of the screen, such as a change the cart
 * couldn't make: in the brand's green, with a way to close them.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      style={
        {
          "--normal-bg": "var(--primary)",
          "--normal-text": "var(--primary-foreground)",
          "--normal-border": "var(--primary)",
          "--border-radius": "var(--radius-lg)",
          "--width": "var(--container-text)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "font-sans text-sm", closeButton: "press-scale" } }}
      {...props}
    />
  );
}

export { toast } from "sonner";
export { Toaster };
