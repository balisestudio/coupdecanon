import * as z from "zod/mini";

/**
 * The storefront's forms, checked alike in the browser and by Medusa, which receives them.
 * Every check says what to fix, in French, in the customer's words. Zod's own French messages
 * stand behind them, for anything unforeseen: never its English ones.
 */
z.config(z.locales.fr());

const tooLong = (max: number) => `${max} caractères au maximum.`;

const requiredText = (max: number, missing: string) =>
  z.string(missing).check(z.trim(), z.minLength(1, missing), z.maxLength(max, tooLong(max)));

const optionalText = (max: number) =>
  z.optional(z.string().check(z.trim(), z.maxLength(max, tooLong(max))));

const name = requiredText(120, "Indiquez votre nom.");
const email = z.pipe(
  z
    .string("Indiquez votre adresse e-mail.")
    .check(
      z.trim(),
      z.minLength(1, "Indiquez votre adresse e-mail."),
      z.maxLength(254, "Cette adresse e-mail est trop longue."),
    ),
  z.email("Cette adresse e-mail n’est pas valide."),
);

/** A phone number as people type it: 10 digits or more, with spaces, dots or a "+". */
const PHONE = /^\+?[\d\s.()-]{10,20}$/;
const phoneCheck = z.regex(PHONE, "Ce numéro de téléphone n’est pas valide.");
const optionalPhone = z.optional(z.string().check(z.trim(), phoneCheck));

/** What a wedding or party request may be about, with its label. */
export const QUOTE_INTERESTS = {
  mignonnettes: "Les mignonnettes",
  boissons: "Les boissons de la réception",
  chateau: "Le château",
} as const;

export type QuoteInterest = keyof typeof QUOTE_INTERESTS;

export const quoteRequestSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  /** `YYYY-MM-DD`, from a date field. */
  eventDate: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/, "Choisissez une date."))),
  guests: z.optional(
    z
      .int("Indiquez un nombre entier d’invités.")
      .check(
        z.positive("Indiquez un nombre d’invités."),
        z.lte(10_000, "Pour plus de 10 000 invités, écrivez-nous."),
      ),
  ),
  miniatures: z.optional(
    z
      .int("Indiquez un nombre entier de mignonnettes.")
      .check(
        z.positive("Indiquez un nombre de mignonnettes."),
        z.lte(100_000, "Pour une telle quantité, écrivez-nous."),
      ),
  ),
  interests: z.array(z.enum(Object.keys(QUOTE_INTERESTS) as [QuoteInterest, ...QuoteInterest[]])),
  message: optionalText(4000),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

/** What a message may be about, with its label. */
export const CONTACT_SUBJECTS = {
  commande: "Une commande",
  devis: "Un devis pour un événement",
  visite: "Une visite au domaine",
  autre: "Autre chose",
} as const;

export type ContactSubject = keyof typeof CONTACT_SUBJECTS;

export const contactMessageSchema = z.object({
  name,
  email,
  subject: z.enum(
    Object.keys(CONTACT_SUBJECTS) as [ContactSubject, ...ContactSubject[]],
    "Choisissez un sujet.",
  ),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, "Écrivez votre message."),
      z.maxLength(4000, "Votre message est trop long."),
    ),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

/** A sign-up to the estate's letter, from the footer. */
export const newsletterSchema = z.object({ email });
export type Newsletter = z.infer<typeof newsletterSchema>;

/** "2027-06-12" → "12 juin 2027". */
export const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

/** The checkout: the customer's details, the pickup, and the two confirmations it needs. */
export const checkoutSchema = z.object({
  email,
  firstName: requiredText(80, "Indiquez votre prénom."),
  lastName: requiredText(80, "Indiquez votre nom."),
  phone: z
    .string("Indiquez un numéro pour vous joindre.")
    .check(z.trim(), z.minLength(1, "Indiquez un numéro pour vous joindre."), phoneCheck),
  shippingOptionId: z
    .string("Choisissez le retrait ou la livraison.")
    .check(z.minLength(1, "Choisissez le retrait ou la livraison.")),
  paymentProviderId: z
    .string("Choisissez un moyen de paiement.")
    .check(z.minLength(1, "Choisissez un moyen de paiement.")),
  ageConfirmed: z.literal(true, "Confirmez avoir 18 ans ou plus."),
  termsAccepted: z.literal(true, "Acceptez les conditions générales de vente pour commander."),
});

export type Checkout = z.infer<typeof checkoutSchema>;

const password = z
  .string("Indiquez votre mot de passe.")
  .check(z.minLength(1, "Indiquez votre mot de passe."), z.maxLength(128, tooLong(128)));

/**
 * What a new password needs, each part shown under the field as it's met. A special
 * character is anything but a letter or a digit.
 */
export const PASSWORD_RULES = [
  { label: "8 caractères", test: (value: string) => [...value].length >= 8 },
  { label: "une majuscule", test: (value: string) => /\p{Lu}/u.test(value) },
  { label: "une minuscule", test: (value: string) => /\p{Ll}/u.test(value) },
  { label: "un chiffre", test: (value: string) => /\p{Nd}/u.test(value) },
  { label: "un caractère spécial", test: (value: string) => /[^\p{L}\p{Nd}]/u.test(value) },
] as const;

export const PASSWORD_HINT =
  "Au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.";

/** Whether a new password meets every rule, for Medusa's own check too. */
export const isStrongPassword = (value: string) =>
  value.length <= 128 && PASSWORD_RULES.every((rule) => rule.test(value));

const newPassword = z.string("Choisissez un mot de passe.").check(
  z.maxLength(128, tooLong(128)),
  z.refine((value) => isStrongPassword(value), PASSWORD_HINT),
);

export const loginSchema = z.object({ email, password });
export type Login = z.infer<typeof loginSchema>;

/** The one answer to a failed sign-in, whichever of the two was wrong. */
export const LOGIN_FAILED = "E-mail ou mot de passe incorrect.";

export const registerSchema = z.object({
  firstName: requiredText(80, "Indiquez votre prénom."),
  lastName: requiredText(80, "Indiquez votre nom."),
  email,
  password: newPassword,
  newsletter: z.boolean("Indiquez si vous voulez recevoir la lettre."),
  termsAccepted: z.literal(
    true,
    "Acceptez les conditions générales d’utilisation pour créer votre compte.",
  ),
});
export type Register = z.infer<typeof registerSchema>;

/** A signed-in customer's new password, given with the one they have. */
export const changePasswordSchema = z.object({ currentPassword: password, newPassword }).check(
  z.refine((data) => data.currentPassword !== data.newPassword, {
    message: "Choisissez un mot de passe différent de l’actuel.",
    path: ["newPassword"],
  }),
);
export type ChangePassword = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  email,
  token: z.string("Ce lien n’est pas valide.").check(z.minLength(1, "Ce lien n’est pas valide.")),
  password: newPassword,
});

export const profileSchema = z.object({
  firstName: requiredText(80, "Indiquez votre prénom."),
  lastName: requiredText(80, "Indiquez votre nom."),
  phone: optionalPhone,
});
export type Profile = z.infer<typeof profileSchema>;

/** A form's errors, by field: the first thing to fix in each. */
export type FieldErrors = Partial<Record<string, string>>;

/** Checks a form's data: its values, cleaned up, or what to fix, field by field. */
function validate<T>(schema: z.ZodMiniType<T>, data: unknown) {
  const result = z.safeParse(schema, data);
  if (result.success) return { ok: true, data: result.data } as const;

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    fields[field] ??= issue.message;
  }
  const error = result.error.issues[0]?.message ?? "Vérifiez le formulaire.";
  return { ok: false, error, fields } as const;
}

export const validateQuoteRequest = (data: unknown) => validate(quoteRequestSchema, data);
export const validateContactMessage = (data: unknown) => validate(contactMessageSchema, data);
export const validateNewsletter = (data: unknown) => validate(newsletterSchema, data);
export const validateCheckout = (data: unknown) => validate(checkoutSchema, data);
export const validateLogin = (data: unknown) => validate(loginSchema, data);
export const validateRegister = (data: unknown) => validate(registerSchema, data);
export const validateForgotPassword = (data: unknown) => validate(forgotPasswordSchema, data);
export const validateResetPassword = (data: unknown) => validate(resetPasswordSchema, data);
export const validateProfile = (data: unknown) => validate(profileSchema, data);
export const validateChangePassword = (data: unknown) => validate(changePasswordSchema, data);
