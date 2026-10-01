import { orderNumber } from "@coupdecanon/config/format";
import { createFileRoute } from "@tanstack/react-router";
import { AccountLayout, formatOrderDate, OrderStatus } from "../../components/account";
import { OrderTotals } from "../../components/order-summary";
import { ProductPicture } from "../../components/product-picture";
import { ReorderButton } from "../../components/reorder-button";
import { SiteLink } from "../../components/site-link";
import { getAccountOrder } from "../../lib/account";
import { formatAmount } from "../../lib/format";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/account/orders/$orderId")({
  loader: ({ params }) => getAccountOrder({ data: { orderId: params.orderId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: pageTitle(
          loaderData ? `Commande ${orderNumber(loaderData.order.displayId)}` : "Commande",
        ),
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { customer, order } = Route.useLoaderData();

  return (
    <AccountLayout
      firstName={customer.firstName}
      title={`Commande ${orderNumber(order.displayId)}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <OrderStatus status={order.status} />
        <span className="text-sm text-muted-foreground">
          Passée le {formatOrderDate(order.createdAt)}
        </span>
      </div>
      <ul className="flex flex-col gap-6 pt-stack">
        {order.lines.map((line) => (
          <li key={line.id} className="flex items-center gap-4">
            <ProductPicture
              product={{
                thumbnail: line.thumbnail,
                title: line.title,
                family: null,
                handle: line.handle ?? line.id,
              }}
              alt=""
              className="aspect-portrait w-16 shrink-0"
            />
            <span className="flex grow flex-col gap-1">
              <SiteLink
                href={line.href ?? undefined}
                className="font-serif text-xl font-medium text-foreground no-underline"
              >
                {line.title}
              </SiteLink>
              <span className="text-sm text-muted-foreground">
                {line.quantity}
                {line.format ? ` × ${line.format}` : ""}
              </span>
            </span>
            <span className="text-sm">{formatAmount(line.total, order.currencyCode)}</span>
          </li>
        ))}
      </ul>
      <OrderTotals
        subtotal={order.subtotal}
        discount={order.discount}
        total={order.total}
        refunded={order.refunded}
        discountLabel={order.discountLabel}
        currencyCode={order.currencyCode}
        className="max-w-text pt-stack"
      />
      <div className="pt-stack">
        <ReorderButton orderId={order.id} />
      </div>
    </AccountLayout>
  );
}
