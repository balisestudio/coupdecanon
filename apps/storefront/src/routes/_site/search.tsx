import { Button } from "@coupdecanon/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@coupdecanon/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@coupdecanon/ui/components/input-group";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-react";
import { debounce, useQueryState } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useId, useRef } from "react";
import { Container } from "../../components/container";
import { ProductTile } from "../../components/product-tile";
import { SectionHeading } from "../../components/section-heading";
import { SiteLink } from "../../components/site-link";
import { pluralizeProducts } from "../../lib/format";
import { PATHS } from "../../lib/paths";
import { getSearchPage, MIN_QUERY_LENGTH } from "../../lib/search";
import { searchSchema } from "../../lib/search-params";
import { pageMeta, pageTitle } from "../../lib/seo";

/** How long the field waits for the typing to pause before searching. */
const TYPING_PAUSE_MS = 250;

/** The query, `?q=poire`. */
const searchParsers = { q: parseAsString.withDefault("") };
const querySearch = searchSchema(searchParsers);

export const Route = createFileRoute("/_site/search")({
  validateSearch: querySearch,
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => getSearchPage({ data: deps }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { meta, links } = pageMeta({
      siteUrl: loaderData.siteUrl,
      path: PATHS.search,
      title: pageTitle(loaderData.query ? `« ${loaderData.query} »` : "Rechercher"),
      description: "Rechercher un produit ou une page du Domaine de Ouézy.",
      // Result pages change with every query: search engines index the pages they lead to.
      noindex: true,
    });
    return { meta, links };
  },
  component: Search,
});

/**
 * The search field. The results follow the typing, once it pauses; the URL keeps the query,
 * through nuqs. At its end, the magnifier searches; once something is typed, a cross takes
 * its place and empties the field.
 */
function SearchField() {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useQueryState("q", searchParsers.q);

  return (
    // Without scripts, the form still searches by loading the page.
    <form
      action={PATHS.search}
      onSubmit={(event) => {
        // With scripts, the search runs at once, without reloading the page.
        event.preventDefault();
        setQuery(query.trim() || null, { history: "push" });
      }}
    >
      <label htmlFor={id} className="sr-only">
        Rechercher dans la boutique
      </label>
      <InputGroup>
        <InputGroupInput
          ref={input}
          id={id}
          type="search"
          name="q"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value || null, {
              limitUrlUpdates: debounce(TYPING_PAUSE_MS),
            })
          }
          placeholder="Un produit, un fruit, une page"
          autoComplete="off"
          enterKeyHint="search"
        />
        <InputGroupAddon>
          {query ? (
            <InputGroupButton
              aria-label="Effacer la recherche"
              onClick={() => {
                setQuery(null);
                input.current?.focus();
              }}
            >
              <XIcon aria-hidden="true" className="size-4" />
            </InputGroupButton>
          ) : (
            <InputGroupButton type="submit" aria-label="Rechercher">
              <SearchIcon aria-hidden="true" className="size-4" />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

function Search() {
  const { query, suggestions, products, pages, currencyCode } = Route.useLoaderData();
  const tooShort = query.length < MIN_QUERY_LENGTH;

  return (
    <div className="pb-section">
      <Container className="flex flex-col gap-stack py-block lg:grid lg:grid-cols-12 lg:gap-x-grid">
        <h1 className="text-4xl lg:col-span-12">Rechercher</h1>
        <search className="lg:col-span-6">
          <SearchField />
        </search>
        {suggestions.length ? (
          <div className="flex flex-wrap items-center gap-2 lg:col-span-12">
            <span className="mr-2 text-sm text-muted-foreground">Recherches fréquentes :</span>
            {suggestions.map((term) => (
              <Button key={term} asChild size="sm" variant={term === query ? "default" : "outline"}>
                <Link to="/search" search={{ q: term }}>
                  {term}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </Container>

      <Container className="flex flex-col gap-block">
        {tooShort ? (
          <p className="pt-block font-serif text-2xl font-medium text-muted-foreground">
            {suggestions.length
              ? "Tapez au moins deux lettres, ou choisissez une recherche fréquente."
              : "Tapez au moins deux lettres."}
          </p>
        ) : products.length ? (
          <section aria-labelledby="resultats-titre" className="flex flex-col gap-block pt-block">
            <SectionHeading
              action={
                <Link to="/cellar" className="text-sm font-medium link-underline">
                  Toute la boutique
                </Link>
              }
            >
              <h2 id="resultats-titre" className="text-3xl">
                {pluralizeProducts(products.length)} pour « {query} »
              </h2>
            </SectionHeading>
            <div className="grid grid-cols-2 items-stretch gap-x-grid gap-y-block lg:grid-cols-4">
              {products.map((product) => (
                <ProductTile key={product.handle} product={product} currencyCode={currencyCode} />
              ))}
            </div>
          </section>
        ) : (
          <Empty className="items-start pt-block text-left">
            <EmptyHeader className="items-start">
              <EmptyTitle>Aucun produit ne correspond à « {query} ».</EmptyTitle>
              <EmptyDescription>
                Essayez « cidre », « jus » ou « calvados », ou parcourez toute la boutique.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="items-start">
              <Button asChild>
                <Link to="/cellar">Parcourir la boutique</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {pages.length ? (
          <section
            aria-labelledby="pages-titre"
            className="flex flex-col gap-block pt-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid"
          >
            <h2 id="pages-titre" className="text-3xl lg:col-span-4">
              Dans le site
            </h2>
            <ul className="flex flex-col gap-8 lg:col-span-7 lg:col-start-6">
              {pages.map((page) => (
                <li key={page.href}>
                  <SiteLink
                    href={page.href}
                    className="group flex items-center justify-between gap-8 text-foreground no-underline"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-serif text-2xl font-medium">{page.name}</span>
                      <span className="text-sm text-muted-foreground">{page.text}</span>
                    </span>
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                    />
                  </SiteLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
