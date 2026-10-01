import { phoneToE164, type ShopContact } from "@coupdecanon/config/shop-info";
import { Logo } from "@coupdecanon/ui/components/logo";
import type { MenuLink } from "../lib/content";
import type { LayoutData } from "../lib/layout";
import { PATHS } from "../lib/paths";
import { Container } from "./container";
import { NewsletterForm } from "./newsletter-form";
import { SiteLink } from "./site-link";

/**
 * The forest-green footer: the newsletter, the site map the team writes in Payload, the logo,
 * the shop's contact details, then the health warning and the legal documents.
 */
export function SiteFooter({
  contact,
  footer,
  families,
  legalLinks,
}: {
  contact: ShopContact | null;
  footer: LayoutData["footer"];
  families: { name: string; slug: string }[];
  legalLinks: MenuLink[];
}) {
  // A column may start with the shop's families, as Medusa has them, however many.
  const columns = footer.columns.map((column) => ({
    title: column.title,
    links: [
      ...(column.families
        ? families.map((family) => ({ label: family.name, url: PATHS.family(family.slug) }))
        : []),
      ...(column.links ?? []),
    ] as MenuLink[],
  }));

  return (
    <footer className="dark bg-background text-foreground">
      <Container className="flex flex-col gap-block py-block">
        <div className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
          <NewsletterForm {...footer.newsletter} className="lg:col-span-5" />
          {/* Three columns a row on desktop, each two of the page's twelve wide. */}
          <div className="grid grid-cols-2 gap-x-grid gap-y-8 lg:col-span-6 lg:col-start-7 lg:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col">
                <h2 className="mb-2 text-xl">{column.title}</h2>
                {column.links.map((link) => (
                  <SiteLink
                    key={link.url}
                    href={link.url}
                    className="flex min-h-9 items-center text-sm text-muted-foreground no-underline hover:text-foreground current:text-foreground"
                  >
                    {link.shortLabel ? (
                      <>
                        <span className="lg:hidden">{link.shortLabel}</span>
                        <span className="max-lg:hidden">{link.label}</span>
                      </>
                    ) : (
                      link.label
                    )}
                  </SiteLink>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-6">
            <Logo className="h-12 w-auto lg:h-16" />
            {contact ? (
              <address className="flex flex-col items-end gap-1 text-right text-sm not-italic">
                <a
                  href={`tel:${phoneToE164(contact.phone)}`}
                  className="text-muted-foreground no-underline hover:text-foreground"
                >
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground no-underline hover:text-foreground"
                >
                  {contact.email}
                </a>
              </address>
            ) : null}
          </div>
          <div className="flex flex-col gap-4 text-xs text-muted-foreground lg:flex-row lg:items-baseline-last lg:justify-between lg:gap-8">
            <p>{footer.healthWarning}</p>
            {legalLinks.length ? (
              <nav aria-label="Informations légales">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.url}>
                      <SiteLink
                        href={link.url}
                        className="no-underline hover:text-foreground current:text-foreground"
                      >
                        {link.label}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
