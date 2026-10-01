import { SANS_FONT_FILE } from "@coupdecanon/ui/lib/fonts";
import {
  type Appearance,
  loadStripe,
  type Stripe,
  type StripeElementsOptionsMode,
  type StripeError,
} from "@stripe/stripe-js";

/**
 * Cards only, wallets such as Apple Pay included: they're settled the moment they're
 * confirmed. Methods that settle days later would need orders to wait for their payment.
 * The card form and the payment Medusa opens at Stripe must agree on it.
 */
export const CARD_PAYMENT_METHODS = ["card"];

let stripe: { key: string; promise: Promise<Stripe | null> } | null = null;

/**
 * Stripe.js, loaded once for the whole visit. Its assistant, a badge it shows over the page in
 * test mode, stays off: customers never see the provider's name.
 */
export function loadCardPayments(key: string) {
  if (stripe?.key !== key) {
    stripe = {
      key,
      promise: loadStripe(key, { locale: "fr", developerTools: { assistant: { enabled: false } } }),
    };
  }
  return stripe.promise;
}

/** A theme variable as the page computes it, such as a color's hex value. */
const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** "#1f3a2a" at half strength: "rgba(31, 58, 42, 0.5)", for the fields' soft focus ring. */
function withAlpha(hex: string, alpha: number) {
  const digits = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(digits)) return hex;
  const [red, green, blue] = [0, 2, 4].map((at) => Number.parseInt(digits.slice(at, at + 2), 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * The card form lives in Stripe's frame, which can't read the page's styles: it takes the
 * theme's colors and font as they're computed on the page.
 */
function appearance(): Appearance {
  const radius = "9999px";

  return {
    theme: "flat",
    variables: {
      fontFamily: token("--font-sans"),
      fontSizeBase: getComputedStyle(document.body).fontSize,
      colorPrimary: token("--primary"),
      colorBackground: token("--background"),
      colorText: token("--foreground"),
      colorTextSecondary: token("--muted-foreground"),
      colorTextPlaceholder: token("--muted-foreground"),
      colorDanger: token("--destructive"),
      borderRadius: radius,
      spacingUnit: "0.25rem",
      gridRowSpacing: "1.25rem",
      gridColumnSpacing: "1.25rem",
    },
    // As the page's own fields: a rounded outline, the label in small above it.
    rules: {
      ".Label": { fontSize: "0.9375rem", fontWeight: "500", marginBottom: "0.5rem" },
      ".Input": {
        backgroundColor: "transparent",
        border: `1px solid ${token("--input")}`,
        borderRadius: radius,
        padding: "0.875rem 1.5rem",
        boxShadow: "none",
      },
      ".Input:focus": {
        borderColor: token("--ring"),
        boxShadow: `0 0 0 3px ${withAlpha(token("--ring"), 0.5)}`,
      },
      ".Input--invalid": { borderColor: token("--destructive"), color: token("--foreground") },
      ".Error": { fontSize: "0.9375rem", paddingLeft: "1.5rem" },
    },
  };
}

/**
 * The card form's settings. Stripe counts the amount in the currency's smallest unit: cents,
 * for the euros the shop sells in.
 */
export function cardFormOptions(amount: number, currencyCode: string): StripeElementsOptionsMode {
  return {
    mode: "payment",
    amount: Math.round(amount * 100),
    currency: currencyCode.toLowerCase(),
    paymentMethodTypes: CARD_PAYMENT_METHODS,
    locale: "fr",
    appearance: appearance(),
    fonts: [
      {
        // The first of the theme's sans-serif fonts, the one the file is for.
        family: token("--font-sans").split(",")[0]?.replaceAll('"', "").trim() ?? "",
        src: `url(${new URL(SANS_FONT_FILE, window.location.origin)})`,
        weight: "400 500",
      },
    ],
  };
}

/**
 * Stripe words card refusals and typing mistakes for the customer, in French; anything else
 * is about the integration, and asks to try again.
 */
export const cardErrorMessage = (error: StripeError) =>
  (error.type === "card_error" || error.type === "validation_error") && error.message
    ? error.message
    : "Le paiement n’a pas abouti. Réessayez, ou choisissez un autre moyen de paiement.";
