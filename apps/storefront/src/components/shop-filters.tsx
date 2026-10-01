import { Button } from "@coupdecanon/ui/components/button";
import { Checkbox } from "@coupdecanon/ui/components/checkbox";
import { Label } from "@coupdecanon/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@coupdecanon/ui/components/select";
import { Link } from "@tanstack/react-router";
import { useQueryStates } from "nuqs";
import { useId } from "react";
import type { Family } from "../lib/catalog.server";
import { type ShopSearch, SORTS, type Sort, shopParsers } from "../lib/shop";
import { Container } from "./container";

/** The family links are buttons: filled for the page's own, outlined for the others. */
const pillVariant = (active: boolean) => (active ? "default" : "outline");

/**
 * The shop's bar: a link per family, with its count, then the "Sans alcool" filter and the
 * sort menu. Both keep to the query string, through nuqs, so a filtered list has its own
 * address and the server renders it. On phones, the families scroll sideways.
 */
export function ShopFilters({
  families,
  selectedCount,
  activeFamily,
  search,
}: {
  families: Family[];
  /** How many products the filter keeps across the shop. */
  selectedCount: number;
  /** The family whose page this is; none on the shop's main page. */
  activeFamily: string | null;
  search: ShopSearch;
}) {
  const alcoholFreeId = useId();
  // Each choice is a new address, which the back button undoes; the page doesn't scroll.
  const [filters, setFilters] = useQueryStates(shopParsers, { history: "push", scroll: false });

  return (
    <div>
      <Container className="flex flex-col gap-2 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <nav aria-label="Familles de produits">
          <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
            <li className="flex shrink-0">
              <Button asChild variant={pillVariant(activeFamily === null)} size="sm">
                {/* Exact, or the router would mark "Tout" as the current page on every family. */}
                <Link
                  to="/cellar"
                  search={search}
                  activeOptions={{ exact: true, includeSearch: false }}
                >
                  Tout ({selectedCount})
                </Link>
              </Button>
            </li>
            {families
              .filter((family) => family.productCount > 0 || family.slug === activeFamily)
              .map((family) => (
                <li key={family.slug} className="flex shrink-0">
                  <Button asChild variant={pillVariant(family.slug === activeFamily)} size="sm">
                    <Link
                      to="/cellar/$family"
                      params={{ family: family.slug }}
                      search={search}
                      activeOptions={{ includeSearch: false }}
                    >
                      {family.name} ({family.productCount})
                    </Link>
                  </Button>
                </li>
              ))}
          </ul>
        </nav>
        <div className="flex items-center justify-between gap-8">
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox
              id={alcoholFreeId}
              checked={filters["alcohol-free"]}
              onCheckedChange={(checked) => setFilters({ "alcohol-free": checked === true })}
            />
            <Label htmlFor={alcoholFreeId}>Sans alcool</Label>
          </div>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters({ sort: value as Sort })}
          >
            <SelectTrigger
              aria-label="Trier les produits"
              className="h-11 border-0 px-0 font-medium"
            >
              <span className="flex items-center gap-1">
                Trier : <SelectValue>{SORTS[filters.sort]}</SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent position="popper" align="end" sideOffset={8}>
              {Object.entries(SORTS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Container>
    </div>
  );
}
