import {
  validateContactMessage,
  validateNewsletter,
  validateQuoteRequest,
} from "@coupdecanon/config/forms";
import { createServerFn } from "@tanstack/react-start";
import { isBot, TOO_MANY_ATTEMPTS, tooManyAttempts } from "./abuse.server";
import type { BotTrapValues } from "./bot-trap";
import { medusa } from "./medusa.server";

type Outcome = { sent: true } | { sent: false; error: string };

/** A public form's data, checked again here since anyone can post to it, and its bot trap. */
const formInput =
  <T>(validate: (data: unknown) => { ok: true; data: T } | { ok: false; error: string }) =>
  (data: unknown) => {
    const { trap, ...fields } = (data ?? {}) as { trap?: BotTrapValues };
    const result = validate(fields);
    if (!result.ok) throw new Error(result.error);
    return { fields: result.data, trap };
  };

const TEN_MINUTES = 10 * 60_000;

/**
 * Sends a public form to Medusa. A script caught by the trap is told it worked, and nothing
 * leaves; a visitor past the limits, here or at Medusa, is asked to wait.
 */
async function sendForm(
  action: string,
  path: string,
  { fields, trap }: { fields: object; trap?: BotTrapValues },
): Promise<Outcome> {
  if (isBot(trap)) return { sent: true };
  if (tooManyAttempts(action, 5, TEN_MINUTES)) return { sent: false, error: TOO_MANY_ATTEMPTS };
  try {
    await medusa.client.fetch(path, { method: "POST", body: fields });
    return { sent: true };
  } catch (error) {
    const limited =
      typeof error === "object" && error !== null && "status" in error && error.status === 429;
    if (limited) return { sent: false, error: TOO_MANY_ATTEMPTS };
    console.error(`The ${action} form could not reach Medusa`, error);
    return { sent: false, error: "L’envoi n’a pas abouti. Réessayez, ou appelez-nous." };
  }
}

/** Sends a wedding or party quote request to the estate, through Medusa. */
export const sendQuoteRequest = createServerFn({ method: "POST" })
  .validator(formInput(validateQuoteRequest))
  .handler(({ data }) => sendForm("devis", "/store/quote-requests", data));

/** Sends a message from the help page to the estate, through Medusa. */
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator(formInput(validateContactMessage))
  .handler(({ data }) => sendForm("contact", "/store/contact-messages", data));

/** Signs an address up to the estate's letter, in Medusa, from the footer. */
export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator(formInput(validateNewsletter))
  .handler(({ data }) => sendForm("lettre", "/store/newsletter", data));
