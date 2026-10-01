import { LEGAL_DOCUMENT_SLUGS, type LegalDocumentSlug } from "@coupdecanon/config/legal";
import type { LegalDocument } from "../payload-types";
import { getCms } from "./cms.server";
import type { RichTextData } from "./content";

type ArticleView = { title: string; anchor: string; content: RichTextData };

/** A legal document as its page takes it: plain data, as a server function returns it. */
export type LegalDocumentView = Pick<LegalDocument, "document" | "title" | "effectiveDate"> & {
  preamble: RichTextData | null;
  articles: ArticleView[];
  appendices: ArticleView[];
};

/** Lexical's own types describe the same JSON in more detail than a server function takes. */
const asData = (content: unknown) => content as RichTextData;

const articleView = ({
  title,
  anchor,
  content,
}: {
  title: string;
  anchor: string;
  content: unknown;
}) => ({
  title,
  anchor,
  content: asData(content),
});

/** The legal documents published, in the footer's order: their titles and addresses. */
export async function listLegalLinks() {
  const cms = await getCms();
  const { docs } = await cms.find({
    collection: "legal-documents",
    depth: 0,
    limit: LEGAL_DOCUMENT_SLUGS.length,
    select: { document: true, title: true },
  });
  return LEGAL_DOCUMENT_SLUGS.flatMap((slug) =>
    docs
      .filter((doc) => doc.document === slug)
      .map((doc) => ({ label: doc.title, url: `/${doc.document}` })),
  );
}

/** A document's version, as an acceptance records it: the day it took effect, "2026-10-01". */
export async function legalVersions(): Promise<Partial<Record<LegalDocumentSlug, string>>> {
  const cms = await getCms();
  const { docs } = await cms.find({
    collection: "legal-documents",
    depth: 0,
    limit: LEGAL_DOCUMENT_SLUGS.length,
    select: { document: true, effectiveDate: true },
  });
  return Object.fromEntries(docs.map((doc) => [doc.document, doc.effectiveDate.slice(0, 10)]));
}

/** A legal document in full, for its page; `null` until the team has written it. */
export async function readLegalDocument(
  slug: LegalDocumentSlug,
): Promise<LegalDocumentView | null> {
  const cms = await getCms();
  const { docs } = await cms.find({
    collection: "legal-documents",
    where: { document: { equals: slug } },
    depth: 0,
    limit: 1,
  });
  const doc = docs[0];
  if (!doc) return null;
  return {
    document: doc.document,
    title: doc.title,
    effectiveDate: doc.effectiveDate,
    preamble: doc.preamble ? asData(doc.preamble) : null,
    articles: (doc.articles ?? []).map(articleView),
    appendices: (doc.appendices ?? []).map(articleView),
  };
}
