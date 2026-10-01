import { formatAddress, phoneToE164 } from "@coupdecanon/config/shop-info";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@coupdecanon/ui/components/accordion";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ContactForm } from "../../components/contact-form";
import { Container } from "../../components/container";
import { PageHero } from "../../components/page-hero";
import { getHelpPage } from "../../lib/pages";
import { PATHS } from "../../lib/paths";
import { jsonLd, pageMeta, pageTitle } from "../../lib/seo";
import type { Help as HelpContent } from "../../payload-types";

export const Route = createFileRoute("/_site/help")({
  loader: () => getHelpPage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl, content } = loaderData;
    const { meta, links } = pageMeta({
      siteUrl,
      path: PATHS.help,
      title: pageTitle(content.seo.title),
      description: content.seo.description,
    });
    return {
      meta,
      links,
      // The questions as a FAQ, which search engines can show with the page.
      scripts: [
        jsonLd({
          "@type": "FAQPage",
          mainEntity: (content.questions ?? []).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      ],
    };
  },
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
  component: Help,
});

/** A question's value in the accordion: its anchor, which links open, or its own id. */
const keyOf = (question: NonNullable<HelpContent["questions"]>[number]) =>
  question.anchor || question.id || question.question;

function Help() {
  const { shop, content } = Route.useLoaderData();
  const { contact } = shop;
  const questions = content.questions ?? [];
  const hash = useRouterState({ select: (state) => state.location.hash });
  const [first] = questions;
  const [openQuestion, setOpenQuestion] = useState(first ? keyOf(first) : "");

  // A link to a question, such as the footer's "Livraison et retrait", opens it, once: the
  // visitor may close it again.
  useEffect(() => {
    if (questions.some((question) => question.anchor === hash)) setOpenQuestion(hash);
  }, [hash, questions]);

  return (
    <div className="pb-section">
      <PageHero title={content.hero.title}>{content.hero.text}</PageHero>
      <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <section aria-labelledby="questions-titre" className="lg:col-span-7">
          <h2 id="questions-titre" className="sr-only">
            Questions fréquentes
          </h2>
          <Accordion
            type="single"
            collapsible
            value={openQuestion}
            onValueChange={setOpenQuestion}
            className="border-t"
          >
            {questions.map((item) => (
              <AccordionItem
                key={keyOf(item)}
                id={item.anchor || undefined}
                value={keyOf(item)}
                className="scroll-mt-40"
              >
                <AccordionTrigger className="py-8 text-2xl">{item.question}</AccordionTrigger>
                {/* Every answer is in the page, closed ones hidden: search engines read them all. */}
                <AccordionContent className="max-w-text pb-8 text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <aside
          id="contact"
          aria-labelledby="ecrire-titre"
          className="flex flex-col gap-stack bg-card p-8 lg:col-span-4 lg:col-start-9"
        >
          <h2 id="ecrire-titre" className="text-3xl">
            {content.contact.title}
          </h2>
          <ContactForm />
          {contact ? (
            <div className="flex flex-col gap-1 pt-6 text-sm">
              <p>
                Téléphone :{" "}
                <a href={`tel:${phoneToE164(contact.phone)}`} className="link-underline">
                  {contact.phone}
                </a>
              </p>
              <p>
                E-mail : <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
              <p className="text-muted-foreground">{formatAddress(contact.address)}</p>
            </div>
          ) : null}
        </aside>
      </Container>
    </div>
  );
}
