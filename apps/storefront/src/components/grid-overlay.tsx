import { cn } from "@coupdecanon/ui/lib/utils";
import { useEffect, useState } from "react";
import { Container } from "./container";

const STORAGE_KEY = "coupdecanon:grille";

/**
 * Development only: the layout's grid over the page, to check what lines up with it. Twelve
 * columns from `lg` on, the two of phone layouts below, inside the page's gutters. Ctrl + G,
 * or the button in the corner, shows and hides it; the choice outlasts reloads.
 */
export function GridOverlay() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    try {
      setShown(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Blocked storage: the grid starts hidden.
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        setShown((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, shown ? "1" : "0");
    } catch {
      // Blocked storage: the choice lasts until the page reloads.
    }
  }, [shown]);

  return (
    <>
      {shown ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
          <Container className="grid h-full grid-cols-2 gap-x-grid lg:grid-cols-12">
            {Array.from({ length: 12 }, (_, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: the columns are fixed
                key={index}
                className={cn("h-full bg-apple-red/10", index >= 2 && "max-lg:hidden")}
              />
            ))}
          </Container>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground opacity-50 hover:opacity-100"
      >
        Grille {shown ? "on" : "off"} (Ctrl + G)
      </button>
    </>
  );
}
