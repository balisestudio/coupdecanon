import { pluralize } from "@coupdecanon/config/format";
import { phoneToE164, type ShopContact } from "@coupdecanon/config/shop-info";
import { Badge } from "@coupdecanon/ui/components/badge";
import { Button } from "@coupdecanon/ui/components/button";
import { Logo } from "@coupdecanon/ui/components/logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@coupdecanon/ui/components/sheet";
import { cn } from "@coupdecanon/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useScrolled } from "../hooks/use-scrolled";
import type { MenuLink } from "../lib/content";
import type { LayoutData } from "../lib/layout";
import { PATHS } from "../lib/paths";
import { useCart } from "./cart";
import { Container } from "./container";
import { SiteLink } from "./site-link";

/** The header's own links, beside the cart: they belong to the site, not to its content. */
const UTILITY_NAV: MenuLink[] = [
  { label: "Rechercher", url: PATHS.search },
  { label: "Compte", url: PATHS.account },
];

const articles = (count: number) => pluralize(count, "article");

/** The official logo, linking home; the logo's title names the link. */
function HomeLink({
  className,
  logoClassName,
  ...props
}: ComponentProps<"a"> & { logoClassName?: string }) {
  return (
    <Link to="/" className={cn("flex", className)} {...props}>
      <Logo className={cn("h-10 w-auto", logoClassName)} />
    </Link>
  );
}

/** Its other props, such as the menu's closing on click, go to the link. */
function CartLink({ count, ...props }: ComponentProps<"a"> & { count: number | null }) {
  return (
    <Button asChild variant="outline" size="sm" className="group px-4">
      <SiteLink
        href={PATHS.cart}
        aria-label={count === null ? "Panier" : `Panier, ${articles(count)}`}
        {...props}
      >
        Panier
        {/* The count inverts with the button on hover, 0 included; it keeps its room until it's known. */}
        <Badge
          aria-hidden="true"
          size="count"
          className={cn(
            "transition-colors group-hover:bg-background group-hover:text-foreground",
            count === null && "invisible",
          )}
        >
          {count ?? 0}
        </Badge>
      </SiteLink>
    </Button>
  );
}

function MobileMenu({
  cartCount,
  contact,
  links,
}: {
  cartCount: number | null;
  contact: ShopContact | null;
  links: MenuLink[];
}) {
  return (
    <Sheet>
      <SheetTrigger className="flex min-h-11 items-center text-sm text-foreground press-scale">
        Menu
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-full gap-0 border-0 p-0 sm:max-w-none"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="grid h-16 shrink-0 grid-cols-3 items-center px-gutter">
          <SheetClose className="flex min-h-11 items-center justify-self-start text-sm press-scale">
            Fermer
          </SheetClose>
          <SheetClose asChild>
            <HomeLink className="justify-self-center" />
          </SheetClose>
          <div className="justify-self-end">
            <SheetClose asChild>
              <CartLink count={cartCount} />
            </SheetClose>
          </div>
        </div>
        <div className="flex grow flex-col overflow-y-auto px-gutter py-6">
          <SheetClose asChild>
            <SiteLink
              href={PATHS.search}
              className="flex h-13 items-center gap-3 rounded-full border border-input px-6 text-sm text-muted-foreground no-underline"
            >
              <SearchIcon aria-hidden="true" className="size-5 text-foreground" strokeWidth={1.5} />
              Rechercher un produit
            </SiteLink>
          </SheetClose>
          <nav aria-label="Navigation principale" className="mt-6">
            <ul>
              {links.map((item) => (
                <li key={item.url}>
                  <SheetClose asChild>
                    <SiteLink
                      href={item.url}
                      className="flex min-h-18 items-center justify-between font-serif text-3xl font-medium no-underline"
                    >
                      {item.label}
                      <ChevronRightIcon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                    </SiteLink>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-col">
            <SheetClose asChild>
              <SiteLink href={PATHS.account} className="flex min-h-12 items-center no-underline">
                Mon compte
              </SiteLink>
            </SheetClose>
            <SheetClose asChild>
              <SiteLink href={PATHS.cart} className="flex min-h-12 items-center no-underline">
                Mon panier{cartCount ? ` (${cartCount})` : ""}
              </SiteLink>
            </SheetClose>
          </div>
          {contact ? (
            <div className="mt-auto flex flex-col gap-2 pt-6 text-sm text-muted-foreground">
              <p>
                <a href={`tel:${phoneToE164(contact.phone)}`}>{contact.phone}</a>,{" "}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
              <p>
                {contact.address.place ?? contact.address.street}, {contact.address.postal_code}{" "}
                {contact.address.city}
              </p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The line the team writes above the header, in Payload: a running offer, a closing day.
 * Without one, there's no bar.
 */
function Announcement({ children }: { children: string }) {
  return (
    <p className="flex h-10 items-center justify-center truncate bg-primary px-gutter text-center text-xs text-primary-foreground">
      {children}
    </p>
  );
}

/**
 * Desktop navigation links, alike on both sides: the shop's sections, and search and account.
 * The section being shown stays underlined, the shop's for its families and products too.
 */
function NavLinks({ label, items }: { label: string; items: MenuLink[] }) {
  return (
    <nav aria-label={label} className="max-lg:hidden">
      <ul className="flex items-center gap-8">
        {items.map((item) => (
          <li key={item.url}>
            <SiteLink
              href={item.url}
              activeOptions={{ includeSearch: false }}
              className="flex min-h-11 items-center text-sm text-foreground no-underline decoration-1 underline-offset-4 hover:underline current:underline"
            >
              {item.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Height changes when the header compacts, skipped for visitors who prefer less motion. */
const COMPACTING = "transition-all duration-300 ease-out motion-reduce:transition-none";

/**
 * The team's announcement and the navigation bar, fixed to the top of the window. Once the
 * page scrolls, the bar compacts to leave the content more room.
 */
export function SiteHeader({
  contact,
  header,
}: {
  contact: ShopContact | null;
  header: LayoutData["header"];
}) {
  const { announcement } = header;
  const compact = useScrolled();
  // The cart loads after the page: its count shows once known, from a cookie at first.
  const cartCount = useCart().count;

  return (
    // The header keeps its full height in the page as the bar compacts, so the content under
    // it doesn't move: what the bar gives up lets the page show through, and clicks through.
    <header
      data-compact={compact || undefined}
      className={cn(
        "group/header pointer-events-none sticky top-0 z-40",
        announcement ? "h-26 lg:h-34" : "h-16 lg:h-24",
      )}
    >
      <div className="pointer-events-auto">
        {announcement ? <Announcement>{announcement}</Announcement> : null}
        {/* The rule under the bar only shows once it compacts; kept transparent, it holds its pixel. */}
        <div className="border-b border-transparent bg-background transition-colors duration-300 group-data-compact/header:border-border motion-reduce:transition-none">
          <Container
            className={cn(
              "grid h-16 grid-cols-3 items-center group-data-compact/header:h-13 lg:h-24 lg:grid-cols-12 lg:gap-x-grid lg:group-data-compact/header:h-16",
              COMPACTING,
            )}
          >
            <div className="justify-self-start lg:col-span-4">
              <div className="lg:hidden">
                <MobileMenu cartCount={cartCount} contact={contact} links={header.menu} />
              </div>
              <NavLinks label="Navigation principale" items={header.main} />
            </div>
            <HomeLink
              className="justify-self-center lg:col-span-4"
              logoClassName={cn(
                "group-data-compact/header:h-8 lg:h-14 lg:group-data-compact/header:h-10",
                COMPACTING,
              )}
            />
            <div className="flex items-center gap-8 justify-self-end lg:col-span-4">
              <NavLinks label="Recherche et compte" items={UTILITY_NAV} />
              <CartLink count={cartCount} />
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
