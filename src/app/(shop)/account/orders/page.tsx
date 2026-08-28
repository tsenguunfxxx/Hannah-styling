import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { requireAuth } from "@/lib/auth-guard";
import { getMyOrders } from "@/lib/queries/order.query";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/order/order-status-badge";

export const metadata: Metadata = { title: "Миний захиалга" };

/**
 * МИНИЙ ЗАХИАЛГА.
 * getMyOrders нь session-ээс userId-г өөрөө авдаг тул
 * өөр хүний захиалга энд ХЭЗЭЭ Ч орж ирэхгүй.
 */
export default async function MyOrdersPage() {
  await requireAuth();

  const orders = await getMyOrders();

  return (
    <div className="container-shop py-12 lg:py-16">
      <p className="label text-graphite">Миний бүртгэл</p>
      <h1 className="mt-3 mb-10 font-display text-3xl font-medium uppercase tracking-label">
        Миний захиалга
      </h1>

      {orders.length === 0 ? (
        <EmptyState
          title="Захиалга алга"
          description="Та одоогоор захиалга хийгээгүй байна."
          actionLabel="Дэлгүүр рүү очих"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/order/${order.orderNumber}`}
                className="group block border border-line p-5 transition-colors hover:border-ink"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display tracking-label">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-graphite">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  {/* Барааны зургууд */}
                  <div className="flex gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-3/4 w-12 shrink-0 overflow-hidden bg-sand"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <span className="label grid aspect-3/4 w-12 shrink-0 place-items-center bg-sand text-graphite">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                    <span className="label mt-1 inline-flex items-center gap-1.5 text-graphite">
                      Дэлгэрэнгүй
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
