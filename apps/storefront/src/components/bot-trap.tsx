import { useEffect, useState } from "react";

/**
 * A field people never see or reach, which scripts fill in, and the time the form was shown:
 * the server ignores forms that fill the one or come back too fast after the other.
 */
export function BotTrap() {
  const [shownAt, setShownAt] = useState<number>();
  useEffect(() => setShownAt(Date.now()), []);

  return (
    <div aria-hidden="true" className="sr-only">
      <label>
        Site web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input type="hidden" name="shownAt" value={shownAt ?? ""} />
    </div>
  );
}
