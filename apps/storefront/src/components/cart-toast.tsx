import { toast } from "@coupdecanon/ui/components/sonner";
import { useEffect } from "react";
import { useCart } from "./cart";

/** How long a refused change's message stays, unless the customer closes it. */
const SHOWN_FOR_MS = 8000;

/**
 * Tells the customer when Medusa refused a change to the cart, which the cart then undid:
 * the change may come from a drawer that has closed since, so the message stands on its own.
 */
export function CartToast() {
  const { error, dismissError } = useCart();

  useEffect(() => {
    if (!error) return;
    toast(error, {
      id: "cart",
      duration: SHOWN_FOR_MS,
      onDismiss: dismissError,
      onAutoClose: dismissError,
    });
  }, [error, dismissError]);

  return null;
}
