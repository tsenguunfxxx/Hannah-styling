import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  getAdminOrders,
  getOrderStatusTabs,
  parseAdminOrderFilters,
} from "@/lib/queries/admin/order.query";
import { formatPrice, formatShortDateTime } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentStatusKey } from "@/lib/constants";
import { PaymentStatusBadge } from "@/components/order/payment-status-badge";

import { OrderFilters } from "@/components/admin/order-filters";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";

export const metadata = { title: "Захиалга" };

/** АДМИН — ЗАХИАЛГЫН ЖАГСААЛТ */
export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const raw = await searchParams;
  const filters = parseAdminOrderFilters(raw);

  const [{ orders, total, page, totalPages }, tabs] = await Promise.all([
    getAdminOrders(filters),
    getOrderStatusTabs(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="label text-graphite">Нийт {total} захиалга</p>
        <h1 className="mt-2 font-display text-2xl font-medium uppercase tracking-label">
          Захиалга
        </h1>
      </div>

      <OrderFilters
        active={filters.status}
        q={filters.q}
        counts={tabs.counts}
        total={tabs.total}
      />

      {orders.length === 0 ? (
        <EmptyState
          title="Захиалга олдсонгүй"
          description="Шүүлтүүрээ өөрчлөөд дахин оролдоно уу."
        />
      ) : (
        <>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-sand/50">
                  <Th>Дугаар</Th>
                  <Th>Захиалагч</Th>
                  <Th>Огноо</Th>
                  <Th>Төлбөр</Th>
                  <Th align="right">Дүн</Th>
                  <Th>Төлөв</Th>
                  <Th align="right" />
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="font-display text-base tracking-label tabular-nums hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-xs text-graphite">
                        {order._count.items} бараа
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {order.customerName}
                      <p className="mt-0.5 text-xs text-graphite tabular-nums">
                        {order.phone}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-graphite tabular-nums">
                      {formatShortDateTime(order.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs">{methodLabel(order.payment?.method)}</p>
                      {order.payment && (
                        <div className="mt-1">
                          <PaymentStatusBadge
                            status={order.payment.status as PaymentStatusKey}
                          />
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(order.total)}
                    </td>

                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        aria-label={`${order.orderNumber} дэлгэрэнгүй`}
                        className="inline-grid size-8 place-items-center border border-line text-graphite transition-colors hover:border-ink hover:text-ink"
                      >
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}

function methodLabel(method: string | undefined) {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? "—";
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`label px-4 py-3 text-graphite ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}
