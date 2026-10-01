/**
 * The legal documents the site publishes, each at its own address, `/legal-notice` and so on,
 * in the order the footer lists them. Their texts and dates are in Payload.
 */
export const LEGAL_DOCUMENTS = {
  "legal-notice": "Mentions légales",
  "terms-of-sale": "Conditions générales de vente",
  "terms-of-use": "Conditions générales d’utilisation",
  privacy: "Politique de confidentialité",
} as const;

export type LegalDocumentSlug = keyof typeof LEGAL_DOCUMENTS;

export const LEGAL_DOCUMENT_SLUGS = Object.keys(LEGAL_DOCUMENTS) as LegalDocumentSlug[];

/** Where the acceptances are kept: in a customer's metadata, and in a cart's, then its order's. */
export const CONSENT_KEY = "consents";

/**
 * What an acceptance records: when, and the versions accepted, each the date the document took
 * effect, "2026-10-01". Payload's documents carry that date: a new date is a new version.
 */
export type Consent = {
  accepted_at: string;
  terms_of_sale?: string;
  terms_of_use?: string;
  privacy_policy?: string;
};
