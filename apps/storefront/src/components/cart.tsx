import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { addToCart, type CartLine, getCart, setCartQuantity } from "../lib/cart";
import { readCartCount } from "../lib/cart-count";

/**
 * A change the customer made to the cart, shown at once and sent to Medusa in turn: an
 * addition, or the quantity they now see for a format.
 */
type Change = {
  kind: "add" | "set";
  variantId: string;
  quantity: number;
  /** Sent to Medusa already: later changes to its format queue behind it. */
  sent: boolean;
  settle: { resolve: () => void; reject: (error: unknown) => void }[];
};

export type CartState = {
  /** The cart's lines as the customer sees them: Medusa's, with their changes on top. */
  lines: CartLine[] | null;
  /** How many items the cart holds, all formats together; `null` while it isn't known. */
  count: number | null;
  /** Whether changes are still on their way to Medusa. */
  syncing: boolean;
  /** Incremented each time the cart settles with Medusa after changes. */
  version: number;
  /** The last change Medusa refused, undone in the cart, for the customer to read. */
  error: string | null;
  dismissError: () => void;
  lineFor: (variantId: string) => CartLine | undefined;
  add: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  /** Reloads the lines from Medusa, such as once the cart became an order. */
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

/** Lines with a change on top: the quantity changes, the line appears or goes. */
function applyChange(lines: CartLine[], change: Change): CartLine[] {
  const line = lines.find((candidate) => candidate.variantId === change.variantId);
  const quantity =
    change.kind === "add" ? (line?.quantity ?? 0) + change.quantity : change.quantity;
  if (quantity <= 0) return lines.filter((candidate) => candidate !== line);
  if (line) {
    return lines.map((candidate) => (candidate === line ? { ...line, quantity } : candidate));
  }
  return [...lines, { id: `nouveau-${change.variantId}`, variantId: change.variantId, quantity }];
}

/** The messages the cart's server functions give; anything else reads as a failed update. */
const KNOWN_FAILURES = [
  "Ce produit n’est plus disponible dans cette quantité.",
  "Le panier n’a pas pu être mis à jour. Réessayez.",
];

const failureOf = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  return KNOWN_FAILURES.includes(message)
    ? message
    : "Le panier n’a pas pu être mis à jour. Réessayez.";
};

const noSubscription = () => () => {};

/**
 * The visitor's cart, for the header's count, the products' buttons and the cart page. It
 * loads in the browser, so the server's pages stay the same for everyone.
 *
 * Changes show at once: they queue up and reach Medusa one after the other, in order, and the
 * quantities clicked while one is on its way merge into a single change. Medusa's answer
 * replaces the cart; a change it refuses comes undone, with its reason.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [confirmed, setConfirmed] = useState<CartLine[] | null>(null);
  const [queue, setQueue] = useState<Change[]>([]);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<Change[]>([]);
  const sendingRef = useRef(false);
  // The count the last page left, read once the page runs: the header needn't wait for Medusa.
  const storedCount = useSyncExternalStore(noSubscription, readCartCount, () => null);

  const commit = useCallback((next: Change[]) => {
    queueRef.current = next;
    setQueue(next);
  }, []);

  const send = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    let changed = false;
    while (queueRef.current.length) {
      const [change] = queueRef.current;
      if (!change) break;
      change.sent = true;
      try {
        const data = { variantId: change.variantId, quantity: change.quantity };
        const lines =
          change.kind === "add" ? await addToCart({ data }) : await setCartQuantity({ data });
        setConfirmed(lines);
        commit(queueRef.current.slice(1));
        for (const { resolve } of change.settle) resolve();
      } catch (failure) {
        commit(queueRef.current.slice(1));
        setError(failureOf(failure));
        for (const { reject } of change.settle) reject(failure);
      }
      changed = true;
    }
    sendingRef.current = false;
    if (changed) setVersion((current) => current + 1);
  }, [commit]);

  const enqueue = useCallback(
    (kind: Change["kind"], variantId: string, quantity: number) =>
      new Promise<void>((resolve, reject) => {
        const pending = queueRef.current;
        const last = pending.at(-1);
        // Another click on the same quantity before it left: only the last one is sent.
        if (
          kind === "set" &&
          last &&
          !last.sent &&
          last.kind === "set" &&
          last.variantId === variantId
        ) {
          commit([
            ...pending.slice(0, -1),
            { ...last, quantity, settle: [...last.settle, { resolve, reject }] },
          ]);
        } else {
          commit([
            ...pending,
            { kind, variantId, quantity, sent: false, settle: [{ resolve, reject }] },
          ]);
        }
        setError(null);
        void send();
      }),
    [commit, send],
  );

  const refresh = useCallback(async () => {
    // Changes on their way bring the cart back themselves.
    if (queueRef.current.length) return;
    try {
      setConfirmed(await getCart());
    } catch {
      // Medusa can't be reached: the count the cookie holds stands until it can.
    }
  }, []);

  useEffect(() => {
    refresh();
    // Back from another tab, the cart may have changed there.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const lines = useMemo(
    () => (confirmed || queue.length ? queue.reduce(applyChange, confirmed ?? []) : null),
    [confirmed, queue],
  );
  const count = lines ? lines.reduce((sum, line) => sum + line.quantity, 0) : storedCount;

  const value = useMemo<CartState>(
    () => ({
      lines,
      count,
      syncing: queue.length > 0,
      version,
      error,
      dismissError: () => setError(null),
      lineFor: (variantId) => lines?.find((line) => line.variantId === variantId),
      add: (variantId, quantity = 1) => enqueue("add", variantId, quantity),
      setQuantity: (variantId, quantity) => enqueue("set", variantId, quantity),
      refresh,
    }),
    [lines, count, queue.length, version, error, enqueue, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart needs a CartProvider");
  return cart;
}

/**
 * Runs a cart change for the control that asked for it, with the reason it failed. The
 * change shows at once: the control stays usable meanwhile.
 */
export function useCartChange() {
  const [failure, setFailure] = useState<string | null>(null);

  const run = useCallback(async (change: () => Promise<void>) => {
    setFailure(null);
    try {
      await change();
    } catch (error) {
      setFailure(failureOf(error));
    }
  }, []);

  return { failure, run };
}
