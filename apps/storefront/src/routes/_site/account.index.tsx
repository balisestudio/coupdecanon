import { orderNumber } from "@coupdecanon/config/format";
import { Button } from "@coupdecanon/ui/components/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@coupdecanon/ui/components/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@coupdecanon/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@coupdecanon/ui/components/table";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { parseAsInteger } from "nuqs/server";
import { AccountLayout, formatOrderDate, OrderStatus } from "../../components/account";
import { SiteLink } from "../../components/site-link";
import { type AccountOrder, getAccountOrders } from "../../lib/account";
import { formatAmount } from "../../lib/format";
import { PATHS } from "../../lib/paths";
import { searchSchema } from "../../lib/search-params";
import { pageTitle } from "../../lib/seo";

/** The page of the history, `?page=2`: the first one keeps the account's plain address. */
const ordersSearch = searchSchema({ page: parseAsInteger.withDefault(1) });

export const Route = createFileRoute("/_site/account/")({
  validateSearch: ordersSearch,
  loaderDeps: ({ search }) => ({ page: Math.max(1, search.page ?? 1) }),
  loader: ({ deps }) => getAccountOrders({ data: deps }),
  head: () => ({
    meta: [{ title: pageTitle("Mes commandes") }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Orders,
});

/**
 * An order's row: its number, its date, where it stands and what it came to, with what was
 * refunded of it. The whole row leads to the order's page, through its number's link.
 */
function OrderRow({ order }: { order: AccountOrder }) {
  return (
    <TableRow className="relative hover:bg-muted/60">
      <TableCell>
        <SiteLink
          href={PATHS.accountOrder(order.id)}
          className="font-medium text-foreground no-underline outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          Commande {orderNumber(order.displayId)}
        </SiteLink>
        {/* Phones have no room for more columns: the date and status go under the number. */}
        <span className="flex flex-col items-start gap-2 pt-1 lg:hidden">
          <span className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</span>
          <OrderStatus status={order.status} />
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground max-lg:hidden">
        {formatOrderDate(order.createdAt)}
      </TableCell>
      <TableCell className="max-lg:hidden">
        <OrderStatus status={order.status} />
      </TableCell>
      <TableCell className="text-right align-top lg:align-middle">
        {formatAmount(order.total, order.currencyCode)}
        {order.refunded ? (
          <span className="block text-sm text-muted-foreground">
            {formatAmount(order.refunded, order.currencyCode)} remboursés
          </span>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

/** The history's pages: the previous and next ones, and each page's number. */
function OrdersPagination({ page, pages }: { page: number; pages: number }) {
  const search = (target: number) => ({ page: target > 1 ? target : undefined });
  return (
    <Pagination>
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem>
            <PaginationLink asChild wide>
              <Link to="/account" search={search(page - 1)} aria-label="Page précédente">
                <ChevronLeftIcon aria-hidden="true" className="size-4" />
                Précédente
              </Link>
            </PaginationLink>
          </PaginationItem>
        ) : null}
        {Array.from({ length: pages }, (_, index) => index + 1).map((target) => (
          <PaginationItem key={target}>
            <PaginationLink asChild isActive={target === page}>
              <Link to="/account" search={search(target)} aria-label={`Page ${target}`}>
                {target}
              </Link>
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < pages ? (
          <PaginationItem>
            <PaginationLink asChild wide>
              <Link to="/account" search={search(page + 1)} aria-label="Page suivante">
                Suivante
                <ChevronRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </PaginationLink>
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

function Orders() {
  const { customer, orders, page, pages } = Route.useLoaderData();

  return (
    <AccountLayout firstName={customer.firstName} title="Mes commandes">
      {orders.length ? (
        <>
          {/* The rows' hover reaches past the text on both sides, which stays in line. */}
          <div className="-mx-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead className="max-lg:hidden">Date</TableHead>
                  <TableHead className="max-lg:hidden">Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
          </div>
          {pages > 1 ? <OrdersPagination page={page} pages={pages} /> : null}
        </>
      ) : (
        <Empty className="items-start text-left">
          <EmptyHeader className="items-start">
            <EmptyTitle>Vous n’avez pas encore passé de commande.</EmptyTitle>
          </EmptyHeader>
          <EmptyContent className="items-start">
            <Button asChild>
              <Link to="/cellar">Parcourir la boutique</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </AccountLayout>
  );
}
