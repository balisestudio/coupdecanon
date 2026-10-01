/** What a form's trap sends: a field only scripts fill in, and when the form was shown. */
export type BotTrapValues = { website?: string; shownAt?: number };

/** The trap's values, from a form's data. */
export const botTrapOf = (values: FormData): BotTrapValues => ({
  website: String(values.get("website") ?? ""),
  shownAt: Number(values.get("shownAt")) || undefined,
});
