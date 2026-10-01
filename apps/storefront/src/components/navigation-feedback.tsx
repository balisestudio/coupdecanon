import { Progress } from "@coupdecanon/ui/components/progress";
import { cn } from "@coupdecanon/ui/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/** Navigations quicker than this show nothing: a bar that flashes reads as a glitch. */
const SHOW_AFTER_MS = 150;

/**
 * A thin bar along the top of the window while the next page loads, so a click on a slow page
 * shows it was taken; it fills as the wait goes on and completes when the page is there.
 */
export function NavigationProgress() {
  const loading = useRouterState({ select: (state) => state.isLoading });
  const [phase, setPhase] = useState<"idle" | "starting" | "loading" | "done">("idle");

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setPhase("starting"), SHOW_AFTER_MS);
      return () => clearTimeout(timer);
    }
    setPhase((current) => (current === "idle" ? "idle" : "done"));
    const timer = setTimeout(() => setPhase("idle"), 400);
    return () => clearTimeout(timer);
  }, [loading]);

  // The bar appears empty, then fills: its first frame gives the fill a start.
  useEffect(() => {
    if (phase !== "starting") return;
    const frame = requestAnimationFrame(() => setPhase("loading"));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  if (phase === "idle") return null;
  return (
    <Progress
      aria-hidden="true"
      value={phase === "starting" ? 0 : phase === "loading" ? 75 : 100}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-1 rounded-none bg-transparent transition-opacity duration-300",
        phase === "done" && "opacity-0",
      )}
      indicatorClassName="rounded-none duration-1000 ease-out motion-reduce:transition-none"
    />
  );
}

/**
 * After the router swaps a page, screen readers hear its title, and keyboard focus moves to
 * its content, as it would after a full page load.
 */
export function RouteAnnouncer() {
  const href = useRouterState({ select: (state) => state.resolvedLocation?.href });
  const [message, setMessage] = useState("");
  const previous = useRef(href);

  useEffect(() => {
    if (!href || href === previous.current) return;
    const [path] = href.split("#");
    const [previousPath] = (previous.current ?? "").split("#");
    previous.current = href;
    // A link within the page, or a search as one types, isn't a new page.
    if (path?.split("?")[0] === previousPath?.split("?")[0]) return;
    const timer = setTimeout(() => {
      setMessage(document.title);
      document.getElementById("content")?.focus({ preventScroll: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [href]);

  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
