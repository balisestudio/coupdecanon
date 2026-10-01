import { Button } from "@coupdecanon/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { reorder } from "../lib/account";
import { useCart, useCartChange } from "./cart";

/** Puts an order's products back in the cart, then opens the cart. */
export function ReorderButton({ orderId, className }: { orderId: string; className?: string }) {
  const navigate = useNavigate();
  const { add } = useCart();
  const { failure, run } = useCartChange();
  const [pending, setPending] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={pending}
        className={className}
        onClick={() =>
          run(async () => {
            setPending(true);
            try {
              const items = await reorder({ data: { orderId } });
              // The additions queue up in the cart, which shows them at once.
              await Promise.all(items.map((item) => add(item.variantId, item.quantity)));
              navigate({ to: "/basket" });
            } finally {
              setPending(false);
            }
          })
        }
      >
        Commander à nouveau
      </Button>
      {failure ? (
        <p role="status" className="text-sm text-destructive">
          Certains produits ne sont plus disponibles.
        </p>
      ) : null}
    </>
  );
}
