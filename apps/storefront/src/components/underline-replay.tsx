import { useEffect } from "react";

/**
 * Replays the `link-underline` sweep when the pointer leaves a link: the stylesheet plays it
 * on hover, and plays it again while a link carries `data-replay`, which this sets on leaving
 * and clears once the sweep ends.
 */
export function UnderlineReplay() {
  useEffect(() => {
    const onLeave = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest(".link-underline");
      if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) {
        return;
      }
      // Restart a sweep still running: removing the attribute alone wouldn't.
      link.removeAttribute("data-replay");
      void (link as HTMLElement).offsetWidth;
      link.setAttribute("data-replay", "");
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "link-underline-sweep" && event.target instanceof Element) {
        event.target.removeAttribute("data-replay");
      }
    };

    document.addEventListener("mouseout", onLeave);
    document.addEventListener("animationend", onEnd);
    return () => {
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("animationend", onEnd);
    };
  }, []);

  return null;
}
